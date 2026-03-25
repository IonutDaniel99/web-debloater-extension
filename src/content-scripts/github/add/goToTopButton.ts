/**
 * GitHub - Go to Top Button
 * 
 * Adds a floating "Go to Top" button on all GitHub pages.
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  console.log('[GitHub GoToTop] Initializing...');

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error('[GitHub GoToTop] Debloater utilities not loaded!');
    return;
  }

  /**
   * Add "Go to Top" floating button
   */
  function addGoToTopButton() {
    // Check if button already exists
    if (document.getElementById('gh-goto-top-btn')) {
      console.log('[GitHub GoToTop] Button already exists');
      return;
    }

    // Create button HTML
    const buttonHTML = `
      <button id="gh-goto-top-btn" title="Go to Top" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #0969da;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        display: none;
        transition: opacity 0.3s, transform 0.3s;
      ">↑</button>
    `;

    // Add button to page
    window.Debloater!.addElements(buttonHTML, 'body', 'append');

    // Get button reference after adding
    const button = document.getElementById('gh-goto-top-btn') as HTMLButtonElement;
    
    if (!button) {
      console.error('[GitHub GoToTop] Failed to add button');
      return;
    }

    // Click handler - scroll to top
    button.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show/hide based on scroll position
    const handleScroll = () => {
      if (window.scrollY > 300) {
        button.style.display = 'block';
      } else {
        button.style.display = 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Hover effects
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
    };
    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
    };

    console.log('[GitHub GoToTop] Button added successfully');
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addGoToTopButton);
  } else {
    addGoToTopButton();
  }

  // Re-add on page navigation (GitHub is SPA - Single Page App)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setTimeout(addGoToTopButton, 500);
    }
  }).observe(document.body, { subtree: true, childList: true });

  console.log('[GitHub GoToTop] Active');
})();
