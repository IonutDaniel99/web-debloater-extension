/**
 * Remove "Get WhatsApp for Windows"
 * Removes the promotional element for WhatsApp desktop app
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 * 
 * NOTE: The promotional banner appears AFTER user clicks on a chat,
 * so we need to wait for #main element and observe chat interactions.
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = 'WhatsApp';
  const SCRIPT_ID = 'removeGetWhatsappForWindows';

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Get selectors from storage
  const SELECTORS = window.Debloater.getSelectors('whatsapp.getWhatsappForWindows');

  let removalObserver = null;
  let hasStartedObserving = false;

  /**
   * Start observing and removing the promotional element
   */
  function startRemovalProcess() {
    if (hasStartedObserving) return;
    hasStartedObserving = true;

    console.log(`[${APP_NAME}][${SCRIPT_ID}] Chat view detected, starting removal process...`);
    
    // Initial removal attempt
    const removed = window.Debloater!.deleteElements(SELECTORS);
    if (removed > 0) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} promotional elements`);
    }

    // Observe for dynamic changes (when element appears after chat loads)
    if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
      window.Debloater!.observeAndRemove(SELECTORS);
    }
  }

  /**
   * Check if #main element exists (indicates chat view is active)
   */
  function checkForChatView() {
    const mainElement = document.querySelector('#main');
    if (mainElement) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] #main element found`);
      startRemovalProcess();
      return true;
    }
    return false;
  }

  // Try immediate check
  if (checkForChatView()) {
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Active (chat view already loaded)`);
    return;
  }

  // If #main doesn't exist yet, observe for it to appear
  console.log(`[${APP_NAME}][${SCRIPT_ID}] Waiting for chat view (#main)...`);
  
  const mainObserver = new MutationObserver((mutations) => {
    if (checkForChatView()) {
      mainObserver.disconnect();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Active (chat view loaded)`);
    }
  });

  // Observe the entire document for #main to appear
  mainObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Cleanup observer after 30 seconds to prevent memory leaks
  setTimeout(() => {
    if (!hasStartedObserving) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Timeout waiting for chat view`);
      mainObserver.disconnect();
    }
  }, 30000);
})();
