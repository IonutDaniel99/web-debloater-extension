/**
 * Script Injector
 * 
 * Handles conditional injection of scripts into web pages.
 * Simple logic: if script is enabled in settings, inject it. Otherwise, don't.
 */

import { SCRIPTS_CONFIG } from "@/page-scripts/scripts";
import { StorageManager } from './storage-manager';
import { loadSelectors } from './selector-manager';
import { BUNDLED_SELECTORS } from './bundled-selectors';

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
   * Inject scripts for current URL on a tab
   */
  static async injectForTab(tabId: number, url: string): Promise<InjectionResult> {
    const injected: string[] = [];
    const skipped: string[] = [];

    // Get scripts that match this URL
    const match = getScriptsForURL(url);
    
    if (!match) {
      return {
        success: true,
        injected: [],
        skipped: [],
      };
    }

    const { siteId, scripts } = match;
    console.log(match)
    
    // Get settings from storage
    const settings = await StorageManager.getSettings();

    // Initialize tracking for this tab if needed
    if (!injectedScripts.has(tabId)) {
      injectedScripts.set(tabId, new Set());
    }
    const tabInjected = injectedScripts.get(tabId)!;

    console.log(`[ScriptInjector] URL: ${url}`);
    console.log(`[ScriptInjector] Site: ${siteId}, Scripts to check:`, scripts.map(s => s.id));

    // Inject dom-utils globally (only once per tab)
    if (!tabInjected.has('__dom_utils__')) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['scripts/core/dom-utils.js'],
          world: 'MAIN',
        });
        tabInjected.add('__dom_utils__');
        console.log(`[ScriptInjector] ✓ Injected dom-utils.js`);
      } catch (error) {
        console.error(`[ScriptInjector] Failed to inject dom-utils:`, error);
      }
    }

    // Inject selectors first (only once per tab)
    if (!tabInjected.has('__selectors__')) {
      try {
        // Load selectors from storage
        const selectorsData = await loadSelectors();
        const dataToInject = selectorsData || BUNDLED_SELECTORS;

        await chrome.scripting.executeScript({
          target: { tabId },
          func: (data) => { window.__SELECTORS__ = data; },
          args: [dataToInject],
          world: 'MAIN',
        });
        
        tabInjected.add('__selectors__');
        console.log(`[ScriptInjector] ✓ Injected selectors`);
      } catch (error) {
        console.error(`[ScriptInjector] Failed to inject selectors:`, error);
      }
    }

    // Inject each script if enabled
    for (const script of scripts) {
      const scriptKey = `${siteId}/${script.id}`;
      
      // Skip if already injected in this tab
      if (tabInjected.has(scriptKey)) {
        console.log(`[ScriptInjector] Already injected ${scriptKey}, skipping`);
        continue;
      }
      
      // Check if script is enabled in global settings
      const isEnabled = settings[siteId]?.[script.id]?.enabled ?? true;
      
      if (!isEnabled) {
        skipped.push(scriptKey);
        console.log(`[ScriptInjector] Skipped ${scriptKey} (disabled in settings)`);
        continue;
      }

      // Inject script
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: [`scripts/${script.scriptPath}`],
          world: 'MAIN',
        });
        
        injected.push(scriptKey);
        tabInjected.add(scriptKey); // Mark as injected
        console.log(`[ScriptInjector] ✓ Injected ${scriptKey}`);
      } catch (error) {
        console.error(`[ScriptInjector] Failed to inject ${scriptKey}:`, error);
        skipped.push(scriptKey);
      }
    }

    return {
      success: true,
      injected,
      skipped,
    };
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
    // Get site config to find URL pattern
    const siteConfig = SCRIPTS_CONFIG.find(s => s.id === siteId);
    if (!siteConfig) return;

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
 * Get scripts that should run for a given URL
 */
export function getScriptsForURL(url: string): {
  siteId: string;
  scripts: Array<{ id: string; scriptPath: string }>;
} | null {
  for (const site of SCRIPTS_CONFIG) {
    // Check if URL matches site's base pattern
    if (!matchesPattern(url, site.urlPatternBase)) continue;

    const scriptsToRun: Array<{ id: string; scriptPath: string }> = [];
    
    // Always add default scripts
    site.defaultScripts.forEach(script => {
      scriptsToRun.push({ id: script.id, scriptPath: script.scriptPath });
    });
    
    // Add path-specific scripts if URL matches
    site.pathScripts.forEach(script => {
      if (matchesPattern(url, script.urlPattern)) {
        scriptsToRun.push({ id: script.id, scriptPath: script.scriptPath });
      }
    });

    return { 
      siteId: site.id,
      scripts: scriptsToRun 
    };
  }

  return null;
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