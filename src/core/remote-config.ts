/**
 * Remote Scripts Configuration
 * 
 * Types and loader for data-driven script configs from GitHub.
 * This enables updating scripts without extension store approval.
 */

import { REMOTE_CONFIG_URL, STORAGE_KEYS } from '../../config';
import type { RemovalConfig } from '@/engines/removal-engine';
import type { EnhancementConfig } from '@/engines/enhancement-engine';

/**
 * Remote configuration structure
 */
export interface RemoteScriptsConfig {
  version: string;
  lastUpdated: string;
  sites: {
    [siteId: string]: RemoteSiteConfig;
  };
}

export interface RemoteSiteConfig {
  name: string;
  urlPatternBase: string;
  icon?: string;
  scripts: {
    [scriptId: string]: RemoteScriptConfig;
  };
}

export interface RemoteScriptConfig {
  id: string;
  name: string;
  description: string;
  type: 'removal' | 'enhancement';
  defaultEnabled: boolean;
  urlPattern?: string;
  bundled?: boolean; // If true, uses legacy bundled script file instead of engines
  removal?: RemoteRemovalConfig;
  enhancement?: RemoteEnhancementConfig;
}

export interface RemoteRemovalConfig {
  selectors: Array<{
    selector: string;
    type?: 'css' | 'xpath' | 'id' | 'class';
  }>;
  observeChanges?: boolean;
  waitFor?: string;
  retryDelay?: number;
  waitForFirstUserInput?: boolean; // Wait for user interaction before activating
  checkAfterFirstInput?: number; // Delay in ms after first user input (default: 250)
}

export interface RemoteFloatingButtonConfig {
  text: string;
  icon?: string;
  style?: {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    backgroundColor?: string;
    color?: string;
    size?: number;
  };
  showOnScroll?: number;
  onClick: string;
  onClickParams?: any[];
}

export interface RemoteKeyboardShortcutConfig {
  keys: string;
  description?: string;
  action: string;
  actionParams?: any[];
  preventDefault?: boolean;
}

export interface RemoteEnhancementConfig {
  enhancementType: 'floating-button' | 'keyboard-shortcut' | 'inline-button';
  floatingButton?: RemoteFloatingButtonConfig;
  keyboardShortcut?: RemoteKeyboardShortcutConfig;
}

/**
 * Storage keys (from central config)
 */
const REMOTE_CONFIG_STORAGE_KEY = STORAGE_KEYS.REMOTE_CONFIG;
const REMOTE_CONFIG_VERSION_KEY = STORAGE_KEYS.REMOTE_CONFIG_VERSION;

/**
 * Default config URL (from central config)
 */
export const DEFAULT_REMOTE_CONFIG_URL = REMOTE_CONFIG_URL;

/**
 * Fetch remote config from URL
 */
export async function fetchRemoteConfig(url: string = DEFAULT_REMOTE_CONFIG_URL): Promise<RemoteScriptsConfig> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch remote config: ${response.status}`);
    }
    const config = await response.json();
    validateRemoteConfig(config);
    return config;
  } catch (error) {
    console.error('[RemoteConfig] Fetch failed:', error);
    throw error;
  }
}

/**
 * Validate remote config structure
 */
function validateRemoteConfig(config: any): asserts config is RemoteScriptsConfig {
  if (!config.version || !config.lastUpdated || !config.sites) {
    throw new Error('Invalid remote config structure');
  }
}

/**
 * Store remote config in chrome.storage.local
 */
export async function storeRemoteConfig(config: RemoteScriptsConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        [REMOTE_CONFIG_STORAGE_KEY]: config,
        [REMOTE_CONFIG_VERSION_KEY]: config.version,
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('[RemoteConfig] Stored, version:', config.version);
          resolve();
        }
      }
    );
  });
}

/**
 * Load remote config from chrome.storage.local
 */
export async function loadRemoteConfig(): Promise<RemoteScriptsConfig | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([REMOTE_CONFIG_STORAGE_KEY], (result: any) => {
      resolve(result[REMOTE_CONFIG_STORAGE_KEY] || null);
    });
  });
}

/**
 * Get remote config version
 */
export async function getRemoteConfigVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([REMOTE_CONFIG_VERSION_KEY], (result: any) => {
      resolve(result[REMOTE_CONFIG_VERSION_KEY] || null);
    });
  });
}

/**
 * Check for remote config updates
 */
export async function checkRemoteConfigUpdates(url: string = DEFAULT_REMOTE_CONFIG_URL): Promise<{
  needsUpdate: boolean;
  localVersion: string | null;
  remoteVersion: string | null;
}> {
  try {
    const [localVersion, remoteConfig] = await Promise.all([
      getRemoteConfigVersion(),
      fetchRemoteConfig(url),
    ]);

    return {
      needsUpdate: !localVersion || localVersion < remoteConfig.version,
      localVersion,
      remoteVersion: remoteConfig.version,
    };
  } catch (error) {
    console.error('[RemoteConfig] Update check failed:', error);
    return {
      needsUpdate: false,
      localVersion: null,
      remoteVersion: null,
    };
  }
}

/**
 * Update remote config (fetch and store)
 */
export async function updateRemoteConfig(url: string = DEFAULT_REMOTE_CONFIG_URL): Promise<boolean> {
  try {
    const config = await fetchRemoteConfig(url);
    await storeRemoteConfig(config);
    return true;
  } catch (error) {
    console.error('[RemoteConfig] Update failed:', error);
    return false;
  }
}

/**
 * Convert remote script config to engine config
 */
export function convertToRemovalConfig(
  siteId: string,
  script: RemoteScriptConfig
): RemovalConfig {
  if (!script.removal) {
    throw new Error(`Script ${script.id} is not a removal script`);
  }

  return {
    id: `${siteId}/${script.id}`,
    name: script.name,
    description: script.description,
    selectors: script.removal.selectors,
    observeChanges: script.removal.observeChanges,
    waitFor: script.removal.waitFor,
    retryDelay: script.removal.retryDelay,
    waitForFirstUserInput: script.removal.waitForFirstUserInput,
    checkAfterFirstInput: script.removal.checkAfterFirstInput,
    conditions: script.urlPattern ? { urlPattern: script.urlPattern } : undefined,
  };
}

/**
 * Convert remote script config to enhancement engine config
 */
export function convertToEnhancementConfig(
  siteId: string,
  script: RemoteScriptConfig
): EnhancementConfig {
  if (!script.enhancement) {
    throw new Error(`Script ${script.id} is not an enhancement script`);
  }

  return {
    id: `${siteId}/${script.id}`,
    name: script.name,
    description: script.description,
    type: script.enhancement.enhancementType,
    floatingButton: script.enhancement.floatingButton,
    keyboardShortcut: script.enhancement.keyboardShortcut,
    conditions: script.urlPattern ? { urlPattern: script.urlPattern } : undefined,
  };
}

/**
 * Get scripts for a specific URL from remote config
 */
export async function getScriptsForURL(url: string): Promise<{
  siteId: string;
  scripts: Array<{ config: RemovalConfig | EnhancementConfig; type: 'removal' | 'enhancement' }>;
} | null> {
  const config = await loadRemoteConfig();
  if (!config) {
    console.log('[RemoteConfig] No remote config loaded');
    return null;
  }

  // Find matching site
  for (const [siteId, siteConfig] of Object.entries(config.sites)) {
    const pattern = new RegExp(siteConfig.urlPatternBase);
    if (pattern.test(url)) {
      // Convert all scripts for this site (skip bundled ones - they use legacy system)
      const scripts = Object.values(siteConfig.scripts)
        .filter((script) => {
          // Skip bundled scripts (handled by legacy injector)
          if (script.bundled) {
            return false;
          }
          
          // Check script-specific URL pattern if exists
          if (script.urlPattern) {
            const scriptPattern = new RegExp(script.urlPattern);
            return scriptPattern.test(url);
          }
          return true;
        })
        .map((script) => {
          if (script.type === 'removal') {
            return {
              config: convertToRemovalConfig(siteId, script),
              type: 'removal' as const,
            };
          } else {
            return {
              config: convertToEnhancementConfig(siteId, script),
              type: 'enhancement' as const,
            };
          }
        });

      return { siteId, scripts };
    }
  }

  return null;
}
