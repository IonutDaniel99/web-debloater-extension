/**
 * Hide End Screen Recommendations
 * Removes recommended videos shown at the end of videos
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../../core/dom-utils.ts" />

(function () {
  'use strict';

  const APP_NAME = 'Instagram';
  const SCRIPT_ID = 'hideProfileContainerHome';

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Get selectors from storage
  const SELECTORS = window.Debloater.getSelectors('instagram.home');

  // Initial removal
  const removed = window.Debloater.deleteElements(SELECTORS);
  if (removed > 0) {
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} home profile elements`);
  }

  // Observe for dynamic changes (Instagram is a SPA)
  if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SELECTORS);
  }

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Active`);
})();