/**
 * Hide Shorts Links
 * Removes links to /shorts/ videos from YouTube
 */

(function() {
  'use strict';

  const settings = window.__SCRIPT_SETTINGS__ || {};

  if (!settings.enabled) {
    console.log('[hideShortsLinks] Disabled in settings');
    return;
  }

  console.log('[hideShortsLinks] Initializing...');

  const SHORTS_LINK_SELECTORS = [
    'a[href*="/shorts/"]',
    'ytd-video-renderer:has(a[href*="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href*="/shorts/"])',
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

  function hideShortsLinks() {
    let totalRemoved = 0;
    SHORTS_LINK_SELECTORS.forEach(selector => {
      const count = removeElements(selector);
      totalRemoved += count;
    });

    if (totalRemoved > 0) {
      console.log(`[hideShortsLinks] Removed ${totalRemoved} shorts links`);
    }
  }

  // Initial removal
  hideShortsLinks();

  // Observe for dynamic changes
  SHORTS_LINK_SELECTORS.forEach(selector => {
    observeAndRemove(selector);
  });

  console.log('[hideShortsLinks] Active');
})();
