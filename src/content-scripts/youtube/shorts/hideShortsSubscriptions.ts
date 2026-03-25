/**
 * Hide Shorts Shelf on Subscriptions
 * Removes the shorts shelf from YouTube subscriptions page
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  console.log('[hideShortsSubscriptions] Initializing...');

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error('[hideShortsSubscriptions] Debloater utilities not loaded!');
    return;
  }

  // Get selectors from storage
  const SHORTS_SHELF_SELECTORS = window.Debloater.getSelectors('youtube.shorts.subscriptions');

  // Initial removal
  const removed = window.Debloater.deleteElements(SHORTS_SHELF_SELECTORS);
  if (removed > 0) {
    console.log(`[hideShortsSubscriptions] Removed ${removed} shorts shelves`);
  }

  // Observe for dynamic changes
  if (SHORTS_SHELF_SELECTORS && (Array.isArray(SHORTS_SHELF_SELECTORS) ? SHORTS_SHELF_SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SHORTS_SHELF_SELECTORS);
  }

  console.log('[hideShortsSubscriptions] Active');
})();
