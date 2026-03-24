/**
 * GitHub Pull Requests Enhancements
 * 
 * Adds enhancements to PR pages like "Go to Top" button.
 * Settings are available via window.__ZONE_SETTINGS__
 */

(function() {
  'use strict';

  const settings = window.__ZONE_SETTINGS__ || {};
  const utils = window.GitHubEnhancer;

  if (!utils) {
    console.error('[GitHub PR] Shared utilities not loaded');
    return;
  }

  if (!settings.enabled) {
    utils.log('PR enhancements disabled in settings');
    return;
  }

  utils.log('PR enhancements initialized');

  /**
   * Add "Go to Top" floating button
   */
  function addGoToTopButton() {
    if (!settings.showGoToTop) return;

    // Check if button already exists
    if (document.getElementById('gh-goto-top-btn')) return;

    // Create button
    const button = document.createElement('button');
    button.id = 'gh-goto-top-btn';
    button.innerHTML = '↑';
    button.title = 'Go to Top';
    
    // Styling
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#0969da',
      color: 'white',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: '10000',
      display: 'none',
      transition: 'opacity 0.3s, transform 0.3s',
    });

    // Click handler
    button.onclick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        button.style.display = 'block';
      } else {
        button.style.display = 'none';
      }
    });

    // Hover effect
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
    };
    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
    };

    document.body.appendChild(button);
    utils.log('Go to Top button added');
  }

  // Initialize enhancements
  addGoToTopButton();

  // Re-add on page navigation (GitHub is SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      setTimeout(addGoToTopButton, 500);
    }
  }).observe(document, { subtree: true, childList: true });

})();
