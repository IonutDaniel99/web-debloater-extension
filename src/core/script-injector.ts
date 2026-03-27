/**
 * Script Injector
 * 
 * Handles conditional injection of scripts into web pages.
 * Supports BOTH:
 * - Bundled scripts (for complex custom scripts)
 * - Data-driven scripts (using generic engines + remote config)
 * 
 * All configuration is loaded from scripts-config.json (stored in chrome.storage).
 */

import { StorageManager } from './storage-manager';
import { getScriptsForURL as getRemoteScriptsForURL, getBundledScriptsForURL, loadRemoteConfig } from './remote-config';
import { executeRemoval } from '@/engines/removal-engine';
import { executeEnhancement } from '@/engines/enhancement-engine';

export interface InjectionResult {
  success: boolean;
  injected: string[]; // List of script IDs that were injected
  skipped: string[]; // List of script IDs that were skipped (disabled)
  error?: string;
}

// Track injected scripts per tab to prevent duplicates
const injectedScripts = new Map<number, Set<string>>();

export class ScriptInjector {
  /**
   * Check if a tab still exists and is valid
   */
  private static async isTabValid(tabId: number): Promise<boolean> {
    try {
      const tab = await chrome.tabs.get(tabId);
      return tab !== undefined;
    } catch (error) {
      // Tab doesn't exist or was closed
      return false;
    }
  }

  /**
   * Inject scripts for current URL on a tab
   * Supports both legacy bundled scripts AND data-driven scripts
   */
  static async injectForTab(tabId: number, url: string): Promise<InjectionResult> {
    const injected: string[] = [];
    const skipped: string[] = [];

    // Validate tab exists before proceeding
    if (!(await this.isTabValid(tabId))) {
      console.log(`[ScriptInjector] Tab ${tabId} no longer exists, skipping injection`);
      return {
        success: false,
        injected: [],
        skipped: [],
        error: 'Tab no longer exists'
      };
    }

    // Initialize tracking for this tab if needed
    if (!injectedScripts.has(tabId)) {
      injectedScripts.set(tabId, new Set());
    }
    const tabInjected = injectedScripts.get(tabId)!;

    console.log(`[ScriptInjector] URL: ${url}`);

    // ===== INJECT CORE UTILITIES ===== 
    
    // Inject dom-utils globally (only once per tab)
    if (!tabInjected.has('__dom_utils__')) {
      // Check tab is still valid before injection
      if (!(await this.isTabValid(tabId))) {
        console.log(`[ScriptInjector] Tab ${tabId} closed before dom-utils injection`);
        return { success: false, injected: [], skipped: [], error: 'Tab closed' };
      }
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['scripts/core/dom-utils.js'],
          world: 'MAIN',
        });
        tabInjected.add('__dom_utils__');
        console.log(`[ScriptInjector] ✓ Injected dom-utils.js`);
      } catch (error: any) {
        // Only log errors that aren't about missing tabs
        if (!error?.message?.includes('No tab with id')) {
          console.error(`[ScriptInjector] Failed to inject dom-utils:`, error);
        }
        return { success: false, injected: [], skipped: [], error: 'Injection failed' };
      }
    }

    // Inject predefined actions (only once per tab)
    if (!tabInjected.has('__predefined_actions__')) {
      // Check tab is still valid before injection
      if (!(await this.isTabValid(tabId))) {
        console.log(`[ScriptInjector] Tab ${tabId} closed before predefined actions injection`);
        return { success: false, injected: [], skipped: [], error: 'Tab closed' };
      }
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            // Inject predefined actions directly without eval
            (window as any).__PREDEFINED_ACTIONS__ = {
              scrollToTop: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
              scrollToBottom: () => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              },
              scrollToElement: (selector: string) => {
                const element = document.querySelector(selector);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              },
              goBack: () => {
                window.history.back();
              },
              goForward: () => {
                window.history.forward();
              },
              reload: () => {
                window.location.reload();
              },
              copyToClipboard: (text: string) => {
                navigator.clipboard.writeText(text).catch(console.error);
              },
              copyCurrentURL: () => {
                navigator.clipboard.writeText(window.location.href).catch(console.error);
              },
              copyPageTitle: () => {
                navigator.clipboard.writeText(document.title).catch(console.error);
              },
              playPause: () => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                  video.paused ? video.play() : video.pause();
                }
              },
              rewindVideo: (seconds: number = 10) => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                  video.currentTime = Math.max(0, video.currentTime - seconds);
                }
              },
              forwardVideo: (seconds: number = 10) => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                  video.currentTime = video.currentTime + seconds;
                }
              },
              toggleFullscreen: () => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              },
              toggleMute: () => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                  video.muted = !video.muted;
                }
              },
              toggleElement: (selector: string) => {
                const element = document.querySelector(selector) as HTMLElement;
                if (element) {
                  element.style.display = element.style.display === 'none' ? '' : 'none';
                }
              },
              focusElement: (selector: string) => {
                const element = document.querySelector(selector) as HTMLElement;
                if (element) {
                  element.focus();
                }
              },
              clickElement: (selector: string) => {
                const element = document.querySelector(selector) as HTMLElement;
                if (element) {
                  element.click();
                }
              },
              printPage: () => {
                window.print();
              },
              openInNewTab: (url: string) => {
                window.open(url, '_blank');
              },
              downloadCurrentPage: () => {
                const a = document.createElement('a');
                a.href = window.location.href;
                a.download = document.title + '.html';
                a.click();
              },
            };
            console.log('[PredefinedActions] Injected into window scope');
          },
          world: 'MAIN',
        });
        
        tabInjected.add('__predefined_actions__');
        console.log(`[ScriptInjector] ✓ Injected predefined actions`);
      } catch (error: any) {
        // Only log errors that aren't about missing tabs
        if (!error?.message?.includes('No tab with id')) {
          console.error(`[ScriptInjector] Failed to inject predefined actions:`, error);
        }
        return { success: false, injected: [], skipped: [], error: 'Injection failed' };
      }
    }

    // Get settings from storage
    const settings = await StorageManager.getSettings();

    // ===== INJECT DATA-DRIVEN SCRIPTS (Priority) =====
    
    const remoteMatch = await getRemoteScriptsForURL(url);
    
    if (remoteMatch) {
      console.log(`[ScriptInjector] Found ${remoteMatch.scripts.length} remote scripts for ${remoteMatch.siteId}`);
      
      for (const { config, type } of remoteMatch.scripts) {
        const scriptKey = config.id;
        
        // Skip if already injected in this tab
        if (tabInjected.has(scriptKey)) {
          console.log(`[ScriptInjector] Already injected ${scriptKey}, skipping`);
          continue;
        }
        
        // Check if script is enabled in settings (use full ID)
        // Support both flat key format ('linkedin/removeSponsoredContent') and extracted scriptId ('removeSponsoredContent')
        const scriptId = config.id.split('/').pop() || config.id;
        const siteId = remoteMatch.siteId;
        
        // Check multiple possible settings locations
        const isEnabled = 
          settings[scriptKey]?.enabled ?? // Flat key with .enabled
          settings[scriptKey] ??  // Flat key boolean
          settings[siteId]?.[scriptId]?.enabled ?? // Nested: site.scriptId.enabled  
          settings[siteId]?.[scriptId] ?? // Nested: site.scriptId boolean
          true; // Default to enabled
        
        if (!isEnabled) {
          skipped.push(scriptKey);
          console.log(`[ScriptInjector] Skipped ${scriptKey} (disabled in settings)`);
          continue;
        }

        // Inject based on type
        try {
          // Validate tab before injection
          if (!(await this.isTabValid(tabId))) {
            console.log(`[ScriptInjector] Tab ${tabId} closed before injecting ${scriptKey}`);
            return { success: false, injected, skipped, error: 'Tab closed' };
          }
          
          if (type === 'removal') {
            await chrome.scripting.executeScript({
              target: { tabId },
              func: executeRemoval,
              args: [config as any],
              world: 'MAIN',
            });
          } else if (type === 'enhancement') {
            await chrome.scripting.executeScript({
              target: { tabId },
              func: executeEnhancement,
              args: [config as any],
              world: 'MAIN',
            });
          }
          
          injected.push(scriptKey);
          tabInjected.add(scriptKey);
          console.log(`[ScriptInjector] ✓ Injected data-driven script ${scriptKey}`);
        } catch (error: any) {
          // Only log errors that aren't about missing tabs
          if (!error?.message?.includes('No tab with id')) {
            console.error(`[ScriptInjector] Failed to inject ${scriptKey}:`, error);
          }
          skipped.push(scriptKey);
        }
      }
    }

    // ===== INJECT BUNDLED SCRIPTS =====
    
    const bundledMatch = await getBundledScriptsForURL(url);
    
    if (bundledMatch) {
      const { siteId, scripts } = bundledMatch;
      console.log(`[ScriptInjector] Site: ${siteId}, Bundled scripts to check:`, scripts.map(s => s.id));

      for (const script of scripts) {
        const scriptKey = `${siteId}/${script.id}`;
        
        // Skip if already injected in this tab (or injected by remote config)
        if (tabInjected.has(scriptKey)) {
          console.log(`[ScriptInjector] Already injected ${scriptKey}, skipping`);
          continue;
        }
        
        // Check if script is enabled in global settings
        const isEnabled = settings[scriptKey]?.enabled ?? settings[siteId]?.[script.id]?.enabled ?? true;
        
        if (!isEnabled) {
          skipped.push(scriptKey);
          console.log(`[ScriptInjector] Skipped ${scriptKey} (disabled in settings)`);
          continue;
        }

        // Inject bundled script
        try {
          // Validate tab before injection
          if (!(await this.isTabValid(tabId))) {
            console.log(`[ScriptInjector] Tab ${tabId} closed before injecting ${scriptKey}`);
            return { success: false, injected, skipped, error: 'Tab closed' };
          }
          
          await chrome.scripting.executeScript({
            target: { tabId },
            files: [`scripts/${script.scriptPath}`],
            world: 'MAIN',
          });
          
          injected.push(scriptKey);
          tabInjected.add(scriptKey);
          console.log(`[ScriptInjector] ✓ Injected bundled script ${scriptKey}`);
        } catch (error: any) {
          // Only log errors that aren't about missing tabs
          if (!error?.message?.includes('No tab with id')) {
            console.error(`[ScriptInjector] Failed to inject ${scriptKey}:`, error);
          }
          skipped.push(scriptKey);
        }
      }
    }

    // Update badge to show active script count
    await this.updateBadge(tabId, injected.length);

    return {
      success: true,
      injected,
      skipped,
    };
  }

  /**
   * Update extension badge to show number of active scripts
   */
  static async updateBadge(tabId: number, count: number): Promise<void> {
    // Validate tab exists before updating badge
    if (!(await this.isTabValid(tabId))) {
      console.log(`[ScriptInjector] Tab ${tabId} no longer exists, skipping badge update`);
      return;
    }
    
    try {
      if (count > 0) {
        await chrome.action.setBadgeText({
          tabId,
          text: count.toString()
        });
        await chrome.action.setBadgeBackgroundColor({
          tabId,
          color: '#0969da' // Blue color
        });
        await chrome.action.setBadgeTextColor({
          tabId,
          color: '#ffffff' // White text
        });
      } else {
        // Clear badge if no scripts
        await chrome.action.setBadgeText({
          tabId,
          text: ''
        });
      }
    } catch (error: any) {
      // Only log errors that aren't about missing tabs
      if (!error?.message?.includes('No tab with id')) {
        console.error('[ScriptInjector] Failed to update badge:', error);
      }
    }
  }

  /**
   * Handle navigation - inject scripts when user navigates
   */
  static async handleNavigation(tabId: number, url: string): Promise<void> {
    await this.injectForTab(tabId, url);
  }

  /**
   * Clear injected scripts tracking for a tab (e.g., when tab reloads)
   */
  static clearTabTracking(tabId: number): void {
    injectedScripts.delete(tabId);
  }

  /**
   * Re-inject scripts on tabs for a specific site (e.g., after settings change)
   * This clears tracking and re-injects based on new settings
   */
  static async refreshTabsForSite(siteId: string): Promise<void> {
    // Get site config from remote config
    const config = await loadRemoteConfig();
    if (!config || !config.sites[siteId]) return;
    
    const siteConfig = config.sites[siteId];
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        // Check if this tab matches the site's URL pattern
        if (matchesPattern(tab.url, siteConfig.urlPatternBase)) {
          // Clear tracking for this tab and reload
          injectedScripts.delete(tab.id);
          await chrome.tabs.reload(tab.id);
        }
      }
    }
  }

  /**
   * Re-inject scripts on all active tabs
   * Use refreshTabsForSite() instead when possible for better UX
   */
  static async refreshAllTabs(): Promise<void> {
    // Clear all tracking
    injectedScripts.clear();
    
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        // Reload the tab to clear old scripts and re-inject
        await chrome.tabs.reload(tab.id);
      }
    }
  }
}

/**
 * Simple regex pattern matching
 */
function matchesPattern(url: string, pattern: string): boolean {
  try {
    return new RegExp(pattern, 'i').test(url);
  } catch {
    return false;
  }
}