/**
 * Hide Reels/Shorts Button
 * Removes the "Shorts" button from YouTube navigation
 */

(function() {
  'use strict';

  const settings = window.__SCRIPT_SETTINGS__ || {};

  if (!settings.enabled) {
    console.log('[hideReelsButton] Disabled in settings');
    return;
  }

  console.log('[hideReelsButton] Initializing...');

  const SHORTS_BUTTON_SELECTORS = [
    'a[title="Shorts"]',
    'a[href*="/shorts"]',
    'ytd-guide-entry-renderer:has(a[href*="/shorts"])',
    '#items > ytd-mini-guide-entry-renderer:nth-child(2)',
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

  function hideReelsButton() {
    let totalRemoved = 0;
    SHORTS_BUTTON_SELECTORS.forEach(selector => {
      const count = removeElements(selector);
      totalRemoved += count;
    });

    if (totalRemoved > 0) {
      console.log(`[hideReelsButton] Removed ${totalRemoved} Shorts buttons`);
    }
  }

  // Initial removal
  hideReelsButton();

  // Observe for dynamic changes
  SHORTS_BUTTON_SELECTORS.forEach(selector => {
    observeAndRemove(selector);
  });

  console.log('[hideReelsButton] Active');
})();
