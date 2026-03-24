/**
 * YouTube Shared Utilities
 * 
 * Common functions used across all YouTube zones
 */

(function() {
  'use strict';

  window.YouTubeDebloater = {
    /**
     * Wait for element to appear in DOM
     */
    waitForElement: function(selector, timeout = 5000) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) {
            observer.disconnect();
            resolve(document.querySelector(selector));
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
      });
    },

    /**
     * Remove elements matching selector
     */
    removeElements: function(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
      return elements.length;
    },

    /**
     * Observe DOM for new elements matching selector and remove them
     */
    observeAndRemove: function(selector) {
      const observer = new MutationObserver(() => {
        this.removeElements(selector);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return observer;
    },

    /**
     * Log message with prefix
     */
    log: function(message) {
      console.log('[YouTube Debloater]', message);
    },
  };
})();
