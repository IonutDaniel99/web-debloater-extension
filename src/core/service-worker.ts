/**
 * Service Worker (Background Script)
 * 
 * Handles:
 * - Extension installation and initialization
 * - 24-hour alarm for automatic update checks
 * - Tab navigation monitoring for script injection
 * - Messages from web page (manual updates, settings changes)
 */

import { UpdateChecker } from '@core/update-checker';
import { ScriptInjector } from '@core/script-injector';
import { StorageManager } from '@core/storage-manager';
import { ENV } from '@/env';

const ALARM_NAME = ENV.ALARM_NAME;
const UPDATE_INTERVAL_HOURS = ENV.UPDATE_INTERVAL_HOURS;

/**
 * Extension installation handler
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details.reason);

  // Initialize default settings and selectors
  await UpdateChecker.initializeSettings();
  await UpdateChecker.initializeBundledSelectors();
  
  if (details.reason === 'install') {
    // First install - try to fetch latest selectors from remote
    const result = await UpdateChecker.checkAndApplyUpdates();
    console.log('Initial update check:', result);
  }

  // Set up 24-hour alarm for automatic updates
  await setupUpdateAlarm();
});

/**
 * Set up periodic alarm for update checks
 */
async function setupUpdateAlarm() {
  // Clear any existing alarm
  await chrome.alarms.clear(ALARM_NAME);
  
  // Create new alarm (every 24 hours)
  await chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: UPDATE_INTERVAL_HOURS * 60,
    delayInMinutes: UPDATE_INTERVAL_HOURS * 60, // First check in 24 hours
  });
  
  console.log(`Update alarm set for every ${UPDATE_INTERVAL_HOURS} hours`);
}

/**
 * Alarm handler - triggered every 24 hours
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('Automatic update check triggered');
    
    const result = await UpdateChecker.checkForUpdates();
    
    if (result.success && result.needsUpdate) {
      // Notify user about available selector updates
      await notifyUpdatesAvailable(1); // One selector update available
    } else {
      console.log('No selector updates available');
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
          const checkResult = await UpdateChecker.checkForUpdates();
          sendResponse({ success: true, data: checkResult });
          break;

        case 'APPLY_UPDATES':
          const applyResult = await UpdateChecker.applyUpdates();
          sendResponse({ success: true, data: applyResult });
          break;

        case 'MANUAL_UPDATE':
          const fullResult = await UpdateChecker.checkAndApplyUpdates();
          sendResponse({ success: true, data: fullResult });
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
async function notifyUpdatesAvailable(count: number) {
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Web Debloater & Enhancer Updates Available',
    message: `${count} zone update(s) available. Click to open settings.`,
    priority: 1,
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
