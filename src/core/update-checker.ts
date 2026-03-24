/**
 * Update Checker
 * 
 * Orchestrates the update checking process:
 * 1. Fetch remote versions from GitHub
 * 2. Compare with local versions
 * 3. Download updated scripts
 * 4. Notify user
 */

import { GitHubFetcher } from './github-fetcher';
import { VersionManager, type VersionComparison } from './version-manager';
import { StorageManager } from './storage-manager';
import { SCRIPTS_CONFIG } from '@config/scripts';
import { BUNDLED_SCRIPTS } from './bundled-scripts';

export interface UpdateCheckResult {
  success: boolean;
  updatesAvailable: VersionComparison[];
  error?: string;
  timestamp: number;
}

export interface UpdateApplyResult {
  success: boolean;
  updated: string[]; // List of "site/zone" that were updated
  failed: string[]; // List of "site/zone" that failed
  error?: string;
}

export class UpdateChecker {
  /**
   * Check for available updates without downloading
   */
  static async checkForUpdates(): Promise<UpdateCheckResult> {
    const timestamp = Date.now();
    
    // Check if GitHub repo is configured
    if (!GitHubFetcher.isConfigured()) {
      return {
        success: false,
        updatesAvailable: [],
        error: 'GitHub repository not configured. Please update config/zones.ts',
        timestamp,
      };
    }

    // Fetch remote versions
    const versionsResult = await GitHubFetcher.fetchVersions();
    if (!versionsResult.success || !versionsResult.data) {
      return {
        success: false,
        updatesAvailable: [],
        error: `Failed to fetch versions: ${versionsResult.error}`,
        timestamp,
      };
    }

    // Compare versions
    const updatesNeeded = await VersionManager.getUpdatesNeeded(versionsResult.data);
    
    // Update last check timestamp
    await StorageManager.setLastUpdateCheck(timestamp);

    return {
      success: true,
      updatesAvailable: updatesNeeded,
      timestamp,
    };
  }

  /**
   * Apply updates by downloading scripts for zones that need updating
   */
  static async applyUpdates(updates: VersionComparison[]): Promise<UpdateApplyResult> {
    const updated: string[] = [];
    const failed: string[] = [];

    for (const update of updates) {
      const scriptKey = `${update.site}/${update.zone}`;
      
      // Find script config to get script path
      const siteConfig = SCRIPTS_CONFIG.find(s => s.id === update.site);
      const scriptConfig = siteConfig?.scripts.find(s => s.id === update.zone);
      
      if (!scriptConfig) {
        failed.push(scriptKey);
        console.error(`Script config not found for ${scriptKey}`);
        continue;
      }

      // Fetch the script
      const scriptResult = await GitHubFetcher.fetchScript(scriptConfig.path);
      
      if (!scriptResult.success || !scriptResult.data) {
        failed.push(scriptKey);
        console.error(`Failed to fetch script for ${scriptKey}: ${scriptResult.error}`);
        continue;
      }

      // Save script to storage
      await StorageManager.setZoneScript(update.site, update.zone, scriptResult.data);
      
      // Update version
      await VersionManager.markZoneUpdated(update.site, update.zone, update.remoteVersion);
      
      updated.push(scriptKey);
      console.log(`Updated ${scriptKey} to version ${update.remoteVersion}`);
    }

    return {
      success: failed.length === 0,
      updated,
      failed,
      error: failed.length > 0 ? `Failed to update: ${failed.join(', ')}` : undefined,
    };
  }

  /**
   * Perform full update check and apply (for manual updates)
   */
  static async checkAndApplyUpdates(): Promise<{
    checkResult: UpdateCheckResult;
    applyResult?: UpdateApplyResult;
  }> {
    const checkResult = await this.checkForUpdates();
    
    if (!checkResult.success || checkResult.updatesAvailable.length === 0) {
      return { checkResult };
    }

    const applyResult = await this.applyUpdates(checkResult.updatesAvailable);
    
    return { checkResult, applyResult };
  }

  /**
   * Initialize extension with bundled fallback scripts
   */
  static async initializeFallbackScripts(): Promise<void> {
    console.log('Loading bundled scripts...');
    
    // Load bundled scripts into storage
    for (const [siteId, scripts] of Object.entries(BUNDLED_SCRIPTS)) {
      for (const [scriptId, scriptContent] of Object.entries(scripts)) {
        await StorageManager.setZoneScript(siteId, scriptId, scriptContent);
        console.log(`Loaded bundled script: ${siteId}/${scriptId}`);
      }
    }
    
    // Initialize default settings from new scripts config
    await StorageManager.initializeDefaults(SCRIPTS_CONFIG);
    
    console.log('Bundled scripts loaded successfully');
  }
}
