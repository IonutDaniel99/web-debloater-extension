/**
 * Storage Manager
 * 
 * Handles all chrome.storage.local operations for:
 * - Zone scripts (downloaded from GitHub)
 * - Zone versions (version tracking per zone)
 * - User settings (nested by site → zone → settings)
 */

export interface ZoneVersions {
  [site: string]: {
    [zone: string]: string; // version number
  };
}

export interface ZoneSettings {
  [site: string]: {
    [zone: string]: {
      [settingKey: string]: boolean | string | number;
    };
  };
}

export interface ZoneScripts {
  [site: string]: {
    [zone: string]: string; // script content as string
  };
}

export interface StorageData {
  versions?: ZoneVersions;
  settings?: ZoneSettings;
  scripts?: ZoneScripts;
  lastUpdateCheck?: number; // timestamp
}

const STORAGE_KEYS = {
  VERSIONS: 'zone_versions',
  SETTINGS: 'zone_settings',
  SCRIPTS: 'zone_scripts',
  LAST_UPDATE_CHECK: 'last_update_check',
} as const;

export class StorageManager {
  /**
   * Get zone versions from storage
   */
  static async getVersions(): Promise<ZoneVersions> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.VERSIONS);
    return result[STORAGE_KEYS.VERSIONS] || {};
  }

  /**
   * Set zone versions in storage
   */
  static async setVersions(versions: ZoneVersions): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.VERSIONS]: versions });
  }

  /**
   * Get version for specific zone
   */
  static async getZoneVersion(site: string, zone: string): Promise<string | null> {
    const versions = await this.getVersions();
    return versions[site]?.[zone] || null;
  }

  /**
   * Set version for specific zone
   */
  static async setZoneVersion(site: string, zone: string, version: string): Promise<void> {
    const versions = await this.getVersions();
    if (!versions[site]) {
      versions[site] = {};
    }
    versions[site][zone] = version;
    await this.setVersions(versions);
  }

  /**
   * Get all zone settings from storage
   */
  static async getSettings(): Promise<ZoneSettings> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return result[STORAGE_KEYS.SETTINGS] || {};
  }

  /**
   * Set all zone settings
   */
  static async setSettings(settings: ZoneSettings): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
  }

  /**
   * Get settings for specific zone
   */
  static async getZoneSettings(site: string, zone: string): Promise<Record<string, any>> {
    const settings = await this.getSettings();
    return settings[site]?.[zone] || {};
  }

  /**
   * Set settings for specific zone
   */
  static async setZoneSettings(
    site: string,
    zone: string,
    zoneSettings: Record<string, any>
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings[site]) {
      settings[site] = {};
    }
    settings[site][zone] = zoneSettings;
    await this.setSettings(settings);
  }

  /**
   * Update a single setting for a zone
   */
  static async updateZoneSetting(
    site: string,
    zone: string,
    key: string,
    value: boolean | string | number
  ): Promise<void> {
    const zoneSettings = await this.getZoneSettings(site, zone);
    zoneSettings[key] = value;
    await this.setZoneSettings(site, zone, zoneSettings);
  }

  /**
   * Get all zone scripts from storage
   */
  static async getScripts(): Promise<ZoneScripts> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SCRIPTS);
    return result[STORAGE_KEYS.SCRIPTS] || {};
  }

  /**
   * Set all zone scripts
   */
  static async setScripts(scripts: ZoneScripts): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.SCRIPTS]: scripts });
  }

  /**
   * Get script for specific zone
   */
  static async getZoneScript(site: string, zone: string): Promise<string | null> {
    const scripts = await this.getScripts();
    return scripts[site]?.[zone] || null;
  }

  /**
   * Set script for specific zone
   */
  static async setZoneScript(site: string, zone: string, scriptContent: string): Promise<void> {
    const scripts = await this.getScripts();
    if (!scripts[site]) {
      scripts[site] = {};
    }
    scripts[site][zone] = scriptContent;
    await this.setScripts(scripts);
  }

  /**
   * Get last update check timestamp
   */
  static async getLastUpdateCheck(): Promise<number> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_UPDATE_CHECK);
    return result[STORAGE_KEYS.LAST_UPDATE_CHECK] || 0;
  }

  /**
   * Set last update check timestamp
   */
  static async setLastUpdateCheck(timestamp: number): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.LAST_UPDATE_CHECK]: timestamp });
  }

  /**
   * Initialize default settings from scripts config
   */
  /**
   * Initialize default settings from sites config
   */
  static async initializeDefaults(sitesConfig: any[]): Promise<void> {
    const settings = await this.getSettings();
    
    for (const site of sitesConfig) {
      if (!settings[site.id]) {
        settings[site.id] = {};
      }
      
      // Initialize settings for default scripts
      for (const script of site.defaultScripts || []) {
        if (!settings[site.id][script.id]) {
          settings[site.id][script.id] = {
            enabled: script.defaultEnabled,
          };
        }
      }
      
      // Initialize settings for path-specific scripts
      for (const script of site.pathScripts || []) {
        if (!settings[site.id][script.id]) {
          settings[site.id][script.id] = {
            enabled: script.defaultEnabled,
          };
        }
      }
    }
    
    await this.setSettings(settings);
  }

  /**
   * Clear all extension data (for debugging/reset)
   */
  static async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }
}
