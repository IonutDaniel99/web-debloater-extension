/**
 * Update Checker
 * 
 * Orchestrates the selector update checking process:
 * 1. Fetch remote selectors from configured URL
 * 2. Compare versions
 * 3. Download and apply updated selectors
 * 4. Notify user
 */

import { VersionManager } from './version-manager';
import { StorageManager } from './storage-manager';
import { SCRIPTS_CONFIG } from "@/page-scripts/scripts";
import { getSelectorVersion, updateSelectors, initializeSelectors } from './selector-manager';
import { BUNDLED_SELECTORS } from './bundled-selectors';
import { ENV } from '@/env';

export interface SelectorUpdateCheckResult {
  success: boolean;
  needsUpdate: boolean;
  localVersion: string | null;
  remoteVersion: string | null;
  error?: string;
  timestamp: number;
}

export interface SelectorUpdateApplyResult {
  success: boolean;
  version?: string;
  error?: string;
}

/**
 * Remote Selectors URL
 * Loaded from .env file (VITE_SELECTORS_URL)
 */
export const SELECTORS_URL = ENV.SELECTORS_URL;

export class UpdateChecker {
  /**
   * Check for selector updates
   */
  static async checkForUpdates(): Promise<SelectorUpdateCheckResult> {
    const timestamp = Date.now();
    
    try {
      // Get local selector version
      const localVersion = await getSelectorVersion();
      
      // Fetch remote selectors to get version
      const response = await fetch(SELECTORS_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch selectors: ${response.status}`);
      }
      
      const remoteData = await response.json();
      const remoteVersion = remoteData.version;
      
      // Compare versions
      const needsUpdate = !localVersion || VersionManager.compareVersions(localVersion, remoteVersion) < 0;
      
      // Update last check timestamp
      await StorageManager.setLastUpdateCheck(timestamp);

      return {
        success: true,
        needsUpdate,
        localVersion,
        remoteVersion,
        timestamp,
      };
    } catch (error) {
      return {
        success: false,
        needsUpdate: false,
        localVersion: null,
        remoteVersion: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
      };
    }
  }

  /**
   * Apply selector updates
   */
  static async applyUpdates(): Promise<SelectorUpdateApplyResult> {
    try {
      const success = await updateSelectors(SELECTORS_URL);
      
      if (success) {
        const version = await getSelectorVersion();
        return { success: true, version: version || undefined };
      }
      
      return { success: false, error: 'Update failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check and apply updates in one call
   */
  static async checkAndApplyUpdates(): Promise<{
    checkResult: SelectorUpdateCheckResult;
    applyResult?: SelectorUpdateApplyResult;
  }> {
    const checkResult = await this.checkForUpdates();
    
    if (!checkResult.success || !checkResult.needsUpdate) {
      return { checkResult };
    }

    const applyResult = await this.applyUpdates();
    
    return { checkResult, applyResult };
  }

  /**
   * Initialize default script settings
   */
  static async initializeSettings(): Promise<void> {
    console.log('Initializing default settings...');
    await StorageManager.initializeDefaults(SCRIPTS_CONFIG);
    console.log('Settings initialized');
  }

  /**
   * Initialize selectors with bundled defaults
   */
  static async initializeBundledSelectors(): Promise<void> {
    const currentVersion = await getSelectorVersion();
    
    if (!currentVersion) {
      console.log('Initializing bundled selectors...');
      await initializeSelectors(BUNDLED_SELECTORS);
      console.log('Bundled selectors initialized');
    }
  }
}

