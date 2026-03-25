/**
 * Hide Shorts Shelf on YouTube Home Page
 * Removes the Shorts shelf (ytd-rich-shelf-renderer) from home page
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../../core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = 'Youtube';
  const SCRIPT_ID = 'hideShortsHome';

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Get selectors from storage
  const SELECTORS = window.Debloater.getSelectors('youtube.shorts.home');

  function hideShortsShelf() {
    const removed = window.Debloater!.deleteElements(SELECTORS);
    if (removed > 0) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} shorts shelves`);
    }
  }

  // Wait for page to be ready
  function init() {
    // Initial removal
    hideShortsShelf();
    
    // Retry after delay for dynamic content
    setTimeout(hideShortsShelf, 1000);
    
    // Observe for dynamic changes
    if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
      window.Debloater!.observeAndRemove(SELECTORS);
    }
    
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Active`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
