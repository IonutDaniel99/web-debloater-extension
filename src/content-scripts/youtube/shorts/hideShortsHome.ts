/**
 * Hide Shorts Shelf on YouTube Home Page
 * Removes the Shorts shelf (ytd-rich-shelf-renderer) from home page
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  console.log('[hideShortsHome] Initializing...');

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error('[hideShortsHome] Debloater utilities not loaded!');
    return;
  }

  // Get selectors from storage
  const SHORTS_SHELF_SELECTORS = window.Debloater.getSelectors('youtube.shorts.home');

  function hideShortsShelf() {
    const removed = window.Debloater!.deleteElements(SHORTS_SHELF_SELECTORS);
    if (removed > 0) {
      console.log(`[hideShortsHome] Removed ${removed} shorts shelves`);
    }
  }

  // Wait for page to be ready
  function init() {
    // Initial removal
    hideShortsShelf();
    
    // Retry after delay for dynamic content
    setTimeout(hideShortsShelf, 1000);
    
    // Observe for dynamic changes
    if (SHORTS_SHELF_SELECTORS && (Array.isArray(SHORTS_SHELF_SELECTORS) ? SHORTS_SHELF_SELECTORS.length > 0 : true)) {
      window.Debloater!.observeAndRemove(SHORTS_SHELF_SELECTORS);
    }
    
    console.log('[hideShortsHome] Active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
