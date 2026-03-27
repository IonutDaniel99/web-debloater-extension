/**
 * Service Worker (Background Script)
 * 
 * Handles:
 * - Extension installation and initialization
 * - Automatic update checks for remote configurations
 * - Tab navigation monitoring for script injection
 * - Messages from web page (manual updates, settings changes)
 */

import { ScriptInjector } from '@core/script-injector';
import { StorageManager } from '@core/storage-manager';
import { storeRemoteConfig, checkRemoteConfigUpdates, updateRemoteConfig } from '@core/remote-config';
import { ENV } from '@/env';
import { ALARMS, AUTO_UPDATE_INTERVAL_HOURS } from '../../config';

// Import bundled config for initial setup
import bundledScriptsConfig from '../../config/scripts-config.json';

const ALARM_NAME = ENV.ALARM_NAME;
const UPDATE_INTERVAL_HOURS = ENV.UPDATE_INTERVAL_HOURS;
const REMOTE_CONFIG_ALARM = ALARMS.REMOTE_CONFIG_UPDATE;

/**
 * Extension installation handler
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details.reason);

  // Initialize bundled remote config (data-driven scripts)
  await storeRemoteConfig(bundledScriptsConfig as any);
  console.log('Bundled remote config initialized');
  
  if (details.reason === 'install') {
    // Try to fetch latest remote config
    try {
      const remoteConfigUpdated = await updateRemoteConfig();
      console.log('Remote config update:', remoteConfigUpdated ? 'success' : 'failed/not configured');
    } catch (error) {
      console.log('Remote config update skipped:', error);
    }
  }

  // Set up 24-hour alarm for automatic updates
  await setupUpdateAlarm();
});

/**
 * Set up periodic alarm for update checks
 */
async function setupUpdateAlarm() {
  // Clear any existing alarms
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.clear(REMOTE_CONFIG_ALARM);
  
  // Create selector update alarm (every 24 hours)
  await chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: UPDATE_INTERVAL_HOURS * 60,
    delayInMinutes: UPDATE_INTERVAL_HOURS * 60, // First check in 24 hours
  });
  
  // Create remote config update alarm (configurable interval for faster script updates)
  await chrome.alarms.create(REMOTE_CONFIG_ALARM, {
    periodInMinutes: AUTO_UPDATE_INTERVAL_HOURS * 60, // From config.ts
    delayInMinutes: 60, // First check in 1 hour
  });
  
  console.log(`Update alarms set - Selectors: ${UPDATE_INTERVAL_HOURS}h, Scripts: ${AUTO_UPDATE_INTERVAL_HOURS}h`);
}

/**
 * Alarm handler - triggered periodically
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('Legacy alarm (unused) - skipping');
  } else if (alarm.name === REMOTE_CONFIG_ALARM) {
    console.log('Automatic remote config check triggered');
    
    const configResult = await checkRemoteConfigUpdates();
    
    if (configResult.needsUpdate) {
      const updated = await updateRemoteConfig();
      if (updated) {
        console.log('Remote config auto-updated:', configResult.remoteVersion);
        await notifyUpdatesAvailable('scripts');
        // Refresh all tabs to apply new scripts
        await ScriptInjector.refreshAllTabs();
      }
    } else {
      console.log('No remote config updates available');
    }
  }
});

/**
 * Tab update handler - inject scripts on navigation
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Clear tracking when page starts loading (prevents duplicate injections)
  if (changeInfo.status === 'loading') {
    ScriptInjector.clearTabTracking(tabId);
  }
  
  // Inject scripts when page has finished loading
  if (changeInfo.status === 'complete' && tab.url) {
    await ScriptInjector.handleNavigation(tabId, tab.url);
  }
});

/**
 * Tab removed handler - clean up tracking
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  ScriptInjector.clearTabTracking(tabId);
});

/**
 * Message handler from web page
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'CHECK_UPDATES':
          const checkResult = await checkRemoteConfigUpdates();
          sendResponse({ success: true, data: checkResult });
          break;

        case 'APPLY_UPDATES':
          const applyResult = await updateRemoteConfig();
          sendResponse({ success: true, data: { success: applyResult } });
          break;

        case 'MANUAL_UPDATE':
          const fullResult = await updateRemoteConfig();
          sendResponse({ success: true, data: { success: fullResult } });
          break;

        case 'UPDATE_SETTING':
          // Update a single zone setting
          await StorageManager.updateZoneSetting(
            message.siteId,
            message.zoneId,
            message.key,
            message.value
          );
          sendResponse({ success: true });
          break;

        case 'SETTINGS_CHANGED':
          // Refresh scripts only on tabs for the specific site
          if (message.siteId) {
            await ScriptInjector.refreshTabsForSite(message.siteId);
          } else {
            // Fallback to refresh all if no siteId provided
            await ScriptInjector.refreshAllTabs();
          }
          sendResponse({ success: true });
          break;

        case 'GET_STORAGE_INFO':
          const versions = await StorageManager.getVersions();
          const settings = await StorageManager.getSettings();
          const lastCheck = await StorageManager.getLastUpdateCheck();
          sendResponse({ 
            success: true, 
            data: { versions, settings, lastCheck }
          });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  })();
  
  // Return true to indicate async response
  return true;
});

/**
 * Show notification about available updates
 */
async function notifyUpdatesAvailable(type: 'selectors' | 'scripts') {
  const messages = {
    selectors: 'Selector updates available. Click to open settings.',
    scripts: 'New scripts available! Extension updated automatically.',
  };
  
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Web Debloater & Enhancer',
    message: messages[type],
    priority: type === 'scripts' ? 2 : 1, // Higher priority for script updates
  });
}

/**
 * Handle notification clicks - open web page
 */
chrome.notifications.onClicked.addListener((_notificationId) => {
  chrome.runtime.openOptionsPage();
});

/**
 * Handle extension icon clicks - open web page
 */
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

console.log('Service worker loaded');
