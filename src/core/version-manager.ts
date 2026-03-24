/**
 * Version Manager
 * 
 * Handles version comparison logic for zone-based updates.
 * Compares local versions (from storage) with remote versions (from GitHub).
 */

import { StorageManager, type ZoneVersions } from './storage-manager';

export interface VersionComparison {
  site: string;
  zone: string;
  localVersion: string | null;
  remoteVersion: string;
  needsUpdate: boolean;
}

export class VersionManager {
  /**
   * Compare semantic version strings (e.g., "1.2.3" vs "1.2.4")
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      
      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    }
    
    return 0;
  }

  /**
   * Check if a zone needs update based on version comparison
   */
  static needsUpdate(localVersion: string | null, remoteVersion: string): boolean {
    if (!localVersion) return true; // No local version = needs initial download
    return this.compareVersions(localVersion, remoteVersion) < 0;
  }

  /**
   * Compare all zones between local and remote versions
   * Returns array of zones that need updates
   */
  static async compareAllVersions(remoteVersions: ZoneVersions): Promise<VersionComparison[]> {
    const localVersions = await StorageManager.getVersions();
    const comparisons: VersionComparison[] = [];

    for (const [site, zones] of Object.entries(remoteVersions)) {
      for (const [zone, remoteVersion] of Object.entries(zones)) {
        const localVersion = localVersions[site]?.[zone] || null;
        
        comparisons.push({
          site,
          zone,
          localVersion,
          remoteVersion,
          needsUpdate: this.needsUpdate(localVersion, remoteVersion),
        });
      }
    }

    return comparisons;
  }

  /**
   * Get only zones that need updates
   */
  static async getUpdatesNeeded(remoteVersions: ZoneVersions): Promise<VersionComparison[]> {
    const allComparisons = await this.compareAllVersions(remoteVersions);
    return allComparisons.filter(c => c.needsUpdate);
  }

  /**
   * Update local version after successful script download
   */
  static async markZoneUpdated(site: string, zone: string, version: string): Promise<void> {
    await StorageManager.setZoneVersion(site, zone, version);
  }

  /**
   * Get formatted version comparison summary
   */
  static formatUpdateSummary(comparisons: VersionComparison[]): string {
    if (comparisons.length === 0) {
      return 'No updates available';
    }

    const updates = comparisons.filter(c => c.needsUpdate);
    if (updates.length === 0) {
      return 'All zones are up to date';
    }

    const summary = updates.map(u => 
      `${u.site}/${u.zone}: ${u.localVersion || 'none'} → ${u.remoteVersion}`
    ).join('\n');

    return `${updates.length} update(s) available:\n${summary}`;
  }
}
