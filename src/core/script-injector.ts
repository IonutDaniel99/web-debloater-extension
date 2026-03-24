/**
 * Script Injector
 * 
 * Handles conditional injection of scripts into web pages using chrome.scripting API.
 * Uses new modular architecture: URL patterns → script files → inject if enabled
 */

import { getScriptsForURL } from '@config/scripts';
import { StorageManager } from './storage-manager';

export interface InjectionResult {
  success: boolean;
  injected: string[]; // List of script IDs that were injected
  skipped: string[]; // List of script IDs that were skipped (disabled or no script)
  error?: string;
}

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

    const { site, scriptIds } = match;
    
    // Get settings from storage
    const settings = await StorageManager.getSettings();

    console.log(`[ScriptInjector] URL: ${url}`);
    console.log(`[ScriptInjector] Site: ${site.id}, Scripts to inject:`, scriptIds);

    // Inject each script if enabled
    for (const scriptId of scriptIds) {
      const scriptKey = `${site.id}/${scriptId}`;
      
      // Check if script is enabled in settings
      const scriptSettings = settings[site.id]?.[scriptId];
      if (!scriptSettings?.enabled) {
        skipped.push(scriptKey);
        console.log(`[ScriptInjector] Skipped ${scriptKey} (disabled)`);
        continue;
      }

      // Get script definition to find the path
      const scriptDef = site.scripts.find(s => s.id === scriptId);
      if (!scriptDef) {
        skipped.push(scriptKey);
        console.warn(`[ScriptInjector] Script definition not found for ${scriptKey}`);
        continue;
      }

      // Inject script
      try {
        // Get script definition to find the path
        const scriptDef = site.scripts.find(s => s.id === scriptId);
        if (!scriptDef) {
          skipped.push(scriptKey);
          console.warn(`[ScriptInjector] Script definition not found for ${scriptKey}`);
          continue;
        }

        // First, inject settings into page
        await chrome.scripting.executeScript({
          target: { tabId },
          func: (config: any) => {
            (window as any).__SCRIPT_SETTINGS__ = config;
          },
          args: [scriptSettings],
          world: 'MAIN',
        });

        // Then inject the script file directly (bypasses Trusted Types)
        await chrome.scripting.executeScript({
          target: { tabId },
          files: [`scripts/${scriptDef.path}`],
          world: 'MAIN',
        });
        
        injected.push(scriptKey);
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
   * Re-inject scripts on all active tabs (e.g., after settings change)
   */
  static async refreshAllTabs(): Promise<void> {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        await this.injectForTab(tab.id, tab.url);
      }
    }
  }
}
