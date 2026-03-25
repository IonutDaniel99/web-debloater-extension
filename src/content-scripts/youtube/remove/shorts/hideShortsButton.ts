/**
 * Hide Shorts Button
 * Removes the "Shorts" button from YouTube navigation
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  console.log('[hideShortsButton] Initializing...');

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error('[hideShortsButton] Debloater utilities not loaded!');
    return;
  }

  // Get selectors from storage
  const SHORTS_BUTTON_SELECTORS = window.Debloater.getSelectors('youtube.shorts.button');

  // Initial removal
  const removed = window.Debloater.deleteElements(SHORTS_BUTTON_SELECTORS);
  if (removed > 0) {
    console.log(`[hideShortsButton] Removed ${removed} Shorts buttons`);
  }

  // Observe for dynamic changes
  if (SHORTS_BUTTON_SELECTORS && (Array.isArray(SHORTS_BUTTON_SELECTORS) ? SHORTS_BUTTON_SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SHORTS_BUTTON_SELECTORS);
  }

  console.log('[hideShortsButton] Active');
})();
