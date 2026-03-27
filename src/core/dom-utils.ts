/**
 * DOM Utilities
 * 
 * Universal DOM manipulation utilities for all content scripts.
 * Injected as window.Debloater for global access.
 */

export type SelectorType = 'css' | 'xpath' | 'id' | 'class';

export interface SelectorConfig {
  selector: string;
  type?: SelectorType;
}

export type SelectorInput = string | SelectorConfig | Array<string | SelectorConfig>;

interface DebloaterUtils {
  addElements: (elements: HTMLElement | string | Array<HTMLElement | string>, parentSelector?: string | null, position?: 'append' | 'prepend' | 'before' | 'after') => void;
  deleteElements: (selectors: SelectorInput) => number;
  observeAndRemove: (selectors: SelectorInput, callback?: ((count: number) => void) | null) => MutationObserver;
  waitForElement: (selector: string, timeout?: number) => Promise<Element>;
}

declare global {
  interface Window {
    Debloater?: DebloaterUtils;
  }
}

// Export to make this an external module
export {};

(function() {
  'use strict';

  /**
   * Normalize selector input to array of configs
   */
  function normalizeSelectors(input: SelectorInput): SelectorConfig[] {
    const inputArray = Array.isArray(input) ? input : [input];
    return inputArray.map(item => 
      typeof item === 'string' 
        ? { selector: item, type: 'css' as SelectorType }
        : { selector: item.selector, type: item.type || 'css' }
    );
  }

  /**
   * Get elements for a single selector config
   */
  function getElements(config: SelectorConfig): Element[] {
    const elements: Element[] = [];
    
    switch (config.type) {
      case 'id':
        const el = document.getElementById(config.selector);
        if (el) elements.push(el);
        break;
        
      case 'xpath':
        const result = document.evaluate(
          config.selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        for (let i = 0; i < result.snapshotLength; i++) {
          const node = result.snapshotItem(i);
          if (node instanceof Element) {
            elements.push(node);
          }
        }
        break;
        
      case 'class':
        // Handle space-separated classes: "class1 class2 class3" -> ".class1.class2.class3"
        elements.push(...Array.from(document.getElementsByClassName(config.selector)));
        break;
      case 'css':
      default:
        elements.push(...Array.from(document.querySelectorAll(config.selector)));
    }
    
    return elements;
  }

  const Debloater: DebloaterUtils = {
    /**
     * Add elements to the DOM
     */
    addElements(elements, parentSelector = null, position = 'append') {
      let parent: Element | null = document.body;
      
      if (parentSelector) {
        if (parentSelector.startsWith('#')) {
          parent = document.getElementById(parentSelector.slice(1));
        } else {
          parent = document.querySelector(parentSelector);
        }
        
        if (!parent) {
          console.warn(`[Debloater] Parent not found: ${parentSelector}`);
          return;
        }
      }
      
      const elementsArray = Array.isArray(elements) ? elements : [elements];
      
      elementsArray.forEach(element => {
        let el: Node | null = null;
        
        if (typeof element === 'string') {
          const temp = document.createElement('div');
          temp.innerHTML = element.trim();
          el = temp.firstChild;
        } else {
          el = element;
        }
        
        if (!el || !parent) return;
        
        switch (position) {
          case 'prepend':
            parent.insertBefore(el, parent.firstChild);
            break;
          case 'before':
            parent.parentNode?.insertBefore(el, parent);
            break;
          case 'after':
            parent.parentNode?.insertBefore(el, parent.nextSibling);
            break;
          default:
            parent.appendChild(el);
        }
      });
    },

    /**
     * Delete elements from the DOM
     * Supports multiple selectors with different types
     */
    deleteElements(selectors) {
      const configs = normalizeSelectors(selectors);
      let totalRemoved = 0;
      
      configs.forEach(config => {
        const elements = getElements(config);
        elements.forEach(el => el.remove());
        totalRemoved += elements.length;
      });
      
      return totalRemoved;
    },

    /**
     * Observe DOM and auto-remove matching elements
     * Supports multiple selectors
     */
    observeAndRemove(selectors, callback = null) {
      const observer = new MutationObserver(() => {
        const count = this.deleteElements(selectors);
        if (count > 0 && callback) {
          callback(count);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return observer;
    },

    /**
     * Wait for element to appear
     */
    waitForElement(selector, timeout = 5000) {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }
        
        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            clearTimeout(timer);
            resolve(element);
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        const timer = setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element not found: ${selector}`));
        }, timeout);
      });
    }
  };

  // Expose globally
  window.Debloater = Debloater;
  
  console.log('[Debloater] DOM utilities loaded');
})();
