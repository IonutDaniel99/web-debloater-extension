/**
 * Hide Reels/Shorts Shelf
 * Removes the reels/shorts shelf from YouTube pages (home, search, etc.)
 */

(function() {
  'use strict';

  const settings = window.__SCRIPT_SETTINGS__ || {};

  if (!settings.enabled) {
    console.log('[hideReelsShelf] Disabled in settings');
    return;
  }

  console.log('[hideReelsShelf] Initializing...');

  const REELS_SHELF_SELECTORS = [
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer[is-shorts]',
    'ytd-shorts',
    '[title*="Shorts"]',
  ];

  // Simple utility to remove elements by selector
  function removeElements(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.remove());
    return elements.length;
  }

  // Observe and remove elements that get added dynamically
  function observeAndRemove(selector) {
    const observer = new MutationObserver(() => {
      removeElements(selector);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function hideReelsShelf() {
    let totalRemoved = 0;
    REELS_SHELF_SELECTORS.forEach(selector => {
      const count = removeElements(selector);
      totalRemoved += count;
    });

    if (totalRemoved > 0) {
      console.log(`[hideReelsShelf] Removed ${totalRemoved} reels shelves`);
    }
  }

  // Initial removal
  hideReelsShelf();

  // Observe for dynamic changes
  REELS_SHELF_SELECTORS.forEach(selector => {
    observeAndRemove(selector);
  });

  console.log('[hideReelsShelf] Active');
})();
