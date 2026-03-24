/**
 * GitHub Shared Utilities
 * 
 * Common functions used across all GitHub zones
 */

(function() {
  'use strict';

  window.GitHubEnhancer = {
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
     * Create a button element with GitHub styling
     */
    createButton: function(text, onClick) {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = 'btn btn-sm';
      button.onclick = onClick;
      return button;
    },

    /**
     * Log message with prefix
     */
    log: function(message) {
      console.log('[GitHub Enhancer]', message);
    },
  };
})();
