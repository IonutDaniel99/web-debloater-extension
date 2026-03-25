/**
 * Hide Shorts Button
 * Removes the "Shorts" button from YouTube navigation
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../../core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = 'Youtube';
  const SCRIPT_ID = 'hideShortsButton';

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Get selectors from storage
  const SELECTORS = window.Debloater.getSelectors('youtube.shorts.button');

  // Initial removal
  const removed = window.Debloater.deleteElements(SELECTORS);
  if (removed > 0) {
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} Shorts buttons`);
  }

  // Observe for dynamic changes
  if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SELECTORS);
  }

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Active`);
})();
