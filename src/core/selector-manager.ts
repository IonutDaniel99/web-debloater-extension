/**
 * Selector Manager
 * 
 * Manages dynamic selectors loaded from remote JSON.
 * Selectors are stored in chrome.storage and updated periodically.
 */

/// <reference types="chrome"/>

import type { SelectorInput } from './dom-utils';
import { SELECTORS_URL } from './update-checker';

export interface SelectorsData {
  version: string;
  lastUpdated: string;
  selectors: {
    [site: string]: {
      [zone: string]: {
        [key: string]: SelectorInput;
      };
    };
  };
}

const STORAGE_KEY = 'selectors_data';

/**
 * Fetch selectors from remote URL
 */
export async function fetchSelectors(url: string = SELECTORS_URL): Promise<SelectorsData> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch selectors: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[SelectorManager] Fetch failed:', error);
    throw error;
  }
}

/**
 * Store selectors in chrome.storage.local
 */
export async function storeSelectors(data: SelectorsData): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log('[SelectorManager] Selectors stored, version:', data.version);
        resolve();
      }
    });
  });
}

/**
 * Load selectors from chrome.storage.local
 */
export async function loadSelectors(): Promise<SelectorsData | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result: any) => {
      resolve(result[STORAGE_KEY] || null);
    });
  });
}

/**
 * Get selectors by path (e.g., 'youtube.shorts.button')
 * Returns the selectors array or empty array if not found
 */
export async function getSelectors(path: string): Promise<SelectorInput> {
  const data = await loadSelectors();
  if (!data) {
    console.warn('[SelectorManager] No selectors loaded, returning empty array');
    return [];
  }

  const parts = path.split('.');
  let current: any = data.selectors;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      console.warn(`[SelectorManager] Selector path not found: ${path}`);
      return [];
    }
  }

  return current || [];
}

/**
 * Get current selector version
 */
export async function getSelectorVersion(): Promise<string | null> {
  const data = await loadSelectors();
  return data?.version || null;
}

/**
 * Update selectors from remote source
 * Returns true if update was successful
 */
export async function updateSelectors(url?: string): Promise<boolean> {
  try {
    const newData = await fetchSelectors(url);
    await storeSelectors(newData);
    return true;
  } catch (error) {
    console.error('[SelectorManager] Update failed:', error);
    return false;
  }
}

/**
 * Initialize selector storage with bundled defaults
 */
export async function initializeSelectors(bundledSelectors: SelectorsData): Promise<void> {
  const existing = await loadSelectors();
  if (!existing) {
    console.log('[SelectorManager] Initializing with bundled selectors');
    await storeSelectors(bundledSelectors);
  }
}
