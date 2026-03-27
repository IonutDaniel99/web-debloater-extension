/**
 * Go to Top Button (Shared)
 * Adds a floating "Go to Top" button that appears on scroll
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 * 
 * Usage: Can be added to any site - just reference in site config
 */

/// <reference path="../../core/dom-utils.ts" />

(function() {
  'use strict';

  const SCRIPT_ID = 'goToTopButton';
  const BUTTON_ID = 'debloater-go-to-top-btn';
  const SHOW_ON_SCROLL = 300; // Show button after scrolling 300px

  console.log(`[${SCRIPT_ID}] Initializing...`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  /**
   * Initialize the Go to Top button
   */
  function init() {
    // Check if button already exists (prevent duplicates)
    if (document.getElementById(BUTTON_ID)) {
      console.log(`[${SCRIPT_ID}] Button already exists, skipping`);
      return;
    }

    createButton();
    setupScrollListener();
    console.log(`[${SCRIPT_ID}] Active`);
  }

  /**
   * Create the floating button
   */
  function createButton() {
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.title = 'Scroll to top';
    button.setAttribute('aria-label', 'Scroll to top');
    
    // Create SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.pointerEvents = 'none';
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'm5 12 7-7 7 7');
    
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M12 19V5');
    
    svg.appendChild(path1);
    svg.appendChild(path2);
    button.appendChild(svg);
    
    // Apply styles - small circular button with dark theme
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #000;
      color: #fff;
      border: 1px solid #666;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease, background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#222';
      button.style.borderColor = '#888';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#000';
      button.style.borderColor = '#666';
    });

    // Click handler - smooth scroll to top
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    document.body.appendChild(button);
  }

  /**
   * Setup scroll listener to show/hide button
   */
  function setupScrollListener() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          if (scrollTop > SHOW_ON_SCROLL) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
          } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
          }
          
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
