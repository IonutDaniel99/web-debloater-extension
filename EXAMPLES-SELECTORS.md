/**
 * Example: Advanced Selector Usage
 * 
 * Shows how to use the new window.Debloater utilities with:
 * - Simple string selectors
 * - Array of selectors
 * - Selector configs with types (css, xpath, id)
 */

// EXAMPLE 1: Simple selector (backwards compatible)
window.Debloater.deleteElements('ytd-rich-shelf-renderer');

// EXAMPLE 2: Array of selectors (all CSS by default)
window.Debloater.deleteElements([
  'ytd-rich-shelf-renderer',
  'ytd-reel-shelf-renderer',
  'ytd-rich-shelf-renderer[is-shorts]',
]);

// EXAMPLE 3: Mixed selector types using configs
window.Debloater.deleteElements([
  { selector: 'ytd-rich-shelf-renderer', type: 'css' },
  { selector: '//div[@class="shorts-shelf"]', type: 'xpath' },
  { selector: 'shorts-container', type: 'id' },
]);

// EXAMPLE 4: Observe and remove with array
window.Debloater.observeAndRemove([
  'ytd-rich-shelf-renderer',
  'ytd-reel-shelf-renderer',
]);

// EXAMPLE 5: Observe with callback
window.Debloater.observeAndRemove(
  ['ytd-rich-shelf-renderer'],
  (count) => {
    console.log(`Removed ${count} elements`);
  }
);

// EXAMPLE 6: Wait for element
window.Debloater.waitForElement('#content')
  .then(el => console.log('Content loaded:', el))
  .catch(err => console.error('Timeout:', err));

// EXAMPLE 7: Add elements
window.Debloater.addElements(
  '<div class="custom-banner">Hello!</div>',
  '#content',
  'prepend'
);
