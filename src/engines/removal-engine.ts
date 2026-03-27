/**
 * Generic Removal Engine
 * 
 * Executes removal scripts based on configuration data.
 * This engine is bundled with the extension and handles all removal operations.
 * 
 * Config-driven approach:
 * - Script logic is here (bundled)
 * - Configuration comes from remote JSON (downloaded)
 * - Chrome Web Store compliant!
 */

/// <reference path="../core/dom-utils.ts" />

export interface RemovalConfig {
  id: string;
  name: string;
  description: string;
  selectors: Array<{
    selector: string;
    type?: 'css' | 'xpath' | 'id' | 'class';
  }>;
  observeChanges?: boolean; // Use MutationObserver (default: true)
  waitFor?: string; // Wait for this selector before running
  retryDelay?: number; // Retry after N milliseconds (for dynamic content)
  waitForFirstUserInput?: boolean; // Wait for user interaction before activating
  checkAfterFirstInput?: number; // Delay in ms after first user input (default: 250)
  conditions?: {
    urlPattern?: string; // Additional URL pattern check
  };
}

/**
 * Execute a removal script based on configuration
 * This function is injected into the page via chrome.scripting.executeScript
 */
export function executeRemoval(config: RemovalConfig) {
  'use strict';

  const APP_NAME = config.id.split('/')[0] || 'RemovalEngine';
  const SCRIPT_ID = config.id.split('/')[1] || config.id;

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing... (data-driven)`);

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Check URL pattern if specified
  if (config.conditions?.urlPattern) {
    const pattern = new RegExp(config.conditions.urlPattern);
    if (!pattern.test(window.location.href)) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] URL pattern doesn't match, skipping`);
      return;
    }
  }

  // Get selectors from config
  const SELECTORS = config.selectors;

  if (!SELECTORS || SELECTORS.length === 0) {
    console.warn(`[${APP_NAME}][${SCRIPT_ID}] No selectors provided in config`);
    return;
  }

  /**
   * Perform removal operation
   */
  function performRemoval() {
    const removed = window.Debloater!.deleteElements(SELECTORS);
    if (removed > 0) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} elements`);
    }
    return removed;
  }

  /**
   * Initialize removal process
   */
  function init() {
    // Initial removal
    performRemoval();

    // Retry if configured (for dynamic content)
    if (config.retryDelay) {
      setTimeout(performRemoval, config.retryDelay);
    }

    // Observe for dynamic changes (default: true)
    const shouldObserve = config.observeChanges !== false;
    if (shouldObserve) {
      window.Debloater!.observeAndRemove(SELECTORS);
    }

    console.log(`[${APP_NAME}][${SCRIPT_ID}] Active (data-driven)`);
  }

  /**
   * Wait for first user input (click, keypress, scroll, etc.)
   */
  function waitForUserInput(): Promise<void> {
    return new Promise((resolve) => {
      const events = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'];
      
      const handleInput = () => {
        events.forEach(event => document.removeEventListener(event, handleInput));
        console.log(`[${APP_NAME}][${SCRIPT_ID}] User input detected`);
        resolve();
      };
      
      events.forEach(event => {
        document.addEventListener(event, handleInput, { once: true, passive: true });
      });
    });
  }

  // Determine initialization strategy
  if (config.waitForFirstUserInput) {
    // Wait for user interaction, then delay, then init
    const delay = config.checkAfterFirstInput ?? 250;
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Waiting for user input...`);
    
    waitForUserInput().then(() => {
      setTimeout(() => {
        console.log(`[${APP_NAME}][${SCRIPT_ID}] ${delay}ms delay after user input, activating...`);
        init();
      }, delay);
    });
  } else if (config.waitFor) {
    // Wait for specific element
    window.Debloater.waitForElement(config.waitFor, 30000)
      .then(init)
      .catch((error) => {
        console.error(`[${APP_NAME}][${SCRIPT_ID}] Wait failed:`, error);
        console.warn(`[${APP_NAME}][${SCRIPT_ID}] Script not activated - required element not found`);
      });
  } else {
    // Run immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
}

/**
 * Wrapper for injection - makes the function self-executing
 */
export function createRemovalScriptInjectable(config: RemovalConfig): string {
  return `(${executeRemoval.toString()})(${JSON.stringify(config)});`;
}
