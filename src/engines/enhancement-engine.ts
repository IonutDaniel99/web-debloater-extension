/**
 * Generic Enhancement Engine
 * 
 * Executes enhancement scripts based on configuration data.
 * This engine is bundled with the extension and handles common enhancement patterns.
 * 
 * Supported enhancement types:
 * - Floating buttons (e.g., scroll to top, quick actions)
 * - Keyboard shortcuts
 * - Custom buttons inserted into existing UI
 * 
 * Config-driven approach:
 * - Script logic is here (bundled)
 * - Configuration + actions come from remote JSON (downloaded)
 * - Chrome Web Store compliant!
 */

/// <reference path="../core/dom-utils.ts" />

export interface FloatingButtonConfig {
  text: string;
  icon?: string; // HTML or emoji
  style?: {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    backgroundColor?: string;
    color?: string;
    size?: number; // Width & height in pixels
  };
  showOnScroll?: number; // Show after scrolling N pixels (0 = always show)
  onClick: string; // Name of predefined action
  onClickParams?: any[]; // Parameters for the action
}

export interface KeyboardShortcutConfig {
  keys: string; // e.g., "Ctrl+Shift+T" or "Space"
  description?: string;
  action: string; // Name of predefined action
  actionParams?: any[];
  preventDefault?: boolean; // Prevent default browser behavior
}

export interface EnhancementConfig {
  id: string;
  name: string;
  description: string;
  type: 'floating-button' | 'keyboard-shortcut' | 'inline-button';
  floatingButton?: FloatingButtonConfig;
  keyboardShortcut?: KeyboardShortcutConfig;
  conditions?: {
    urlPattern?: string;
  };
}

/**
 * Execute an enhancement script based on configuration
 */
export function executeEnhancement(config: EnhancementConfig) {
  'use strict';

  const APP_NAME = config.id.split('/')[0] || 'EnhancementEngine';
  const SCRIPT_ID = config.id.split('/')[1] || config.id;

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing... (data-driven)`);

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Check URL pattern if specified
  if (config.conditions?.urlPattern) {
    const pattern = new RegExp(config.conditions.urlPattern);
    if (!pattern.test(window.location.href)) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] URL pattern doesn't match, skipping`);
      return;
    }
  }

  /**
   * Initialize enhancement
   */
  function init() {
    // Execute based on type
    if (config.type === 'floating-button' && config.floatingButton) {
      createFloatingButton(config.floatingButton, SCRIPT_ID);
    } else if (config.type === 'keyboard-shortcut' && config.keyboardShortcut) {
      registerKeyboardShortcut(config.keyboardShortcut);
    }

    console.log(`[${APP_NAME}][${SCRIPT_ID}] Active (data-driven)`);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Create a floating button
   */
  function createFloatingButton(btnConfig: FloatingButtonConfig, scriptId: string) {
    const buttonId = `floating-btn-${scriptId}`;

    // Check if button already exists
    if (document.getElementById(buttonId)) {
      console.log(`[${SCRIPT_ID}] Floating button already exists`);
      return;
    }

    // Get predefined action
    const action = (window as any).__PREDEFINED_ACTIONS__?.[btnConfig.onClick];
    if (!action) {
      console.error(`[${SCRIPT_ID}] Predefined action not found: ${btnConfig.onClick}`);
      return;
    }

    // Position mapping
    const positions = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
    };

    const position = positions[btnConfig.style?.position || 'bottom-right'];
    const size = btnConfig.style?.size || 50;
    const bgColor = btnConfig.style?.backgroundColor || '#0969da';
    const textColor = btnConfig.style?.color || 'white';
    const showOnScroll = btnConfig.showOnScroll ?? 300;

    // Create button
    const button = document.createElement('button');
    button.id = buttonId;
    button.title = config.description;
    button.textContent = btnConfig.icon || btnConfig.text;
    button.style.cssText = `
      position: fixed;
      ${Object.entries(position).map(([k, v]) => `${k}: ${v}`).join('; ')};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${bgColor};
      color: ${textColor};
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      display: ${showOnScroll > 0 ? 'none' : 'block'};
      transition: opacity 0.3s, transform 0.3s;
    `;

    // Append to body
    document.body.appendChild(button);

    // Click handler
    button.onclick = () => {
      action(...(btnConfig.onClickParams || []));
    };

    // Show/hide on scroll
    if (showOnScroll > 0) {
      const handleScroll = () => {
        button.style.display = window.scrollY > showOnScroll ? 'block' : 'none';
      };
      window.addEventListener('scroll', handleScroll);
    }

    // Hover effects
    button.onmouseenter = () => {
      button.style.transform = 'scale(1.1)';
    };
    button.onmouseleave = () => {
      button.style.transform = 'scale(1)';
    };

    console.log(`[${SCRIPT_ID}] Floating button created`);
  }

  /**
   * Register a keyboard shortcut
   */
  function registerKeyboardShortcut(shortcutConfig: KeyboardShortcutConfig) {
    // Get predefined action
    const action = (window as any).__PREDEFINED_ACTIONS__?.[shortcutConfig.action];
    if (!action) {
      console.error(`[${SCRIPT_ID}] Predefined action not found: ${shortcutConfig.action}`);
      return;
    }

    // Parse key combination
    const keys = shortcutConfig.keys.toLowerCase().split('+').map(k => k.trim());
    const requiresCtrl = keys.includes('ctrl');
    const requiresShift = keys.includes('shift');
    const requiresAlt = keys.includes('alt');
    const mainKey = keys.find(k => !['ctrl', 'shift', 'alt'].includes(k));

    document.addEventListener('keydown', (event) => {
      // Check modifiers
      if (requiresCtrl && !event.ctrlKey) return;
      if (requiresShift && !event.shiftKey) return;
      if (requiresAlt && !event.altKey) return;
      if (!requiresCtrl && event.ctrlKey) return;
      if (!requiresShift && event.shiftKey) return;
      if (!requiresAlt && event.altKey) return;

      // Check main key
      if (mainKey && event.key.toLowerCase() !== mainKey) return;

      // Prevent default if configured
      if (shortcutConfig.preventDefault) {
        event.preventDefault();
      }

      // Execute action
      action(...(shortcutConfig.actionParams || []));
    });

    console.log(`[${SCRIPT_ID}] Keyboard shortcut registered: ${shortcutConfig.keys}`);
  }
}

/**
 * Wrapper for injection
 */
export function createEnhancementScriptInjectable(config: EnhancementConfig): string {
  return `(${executeEnhancement.toString()})(${JSON.stringify(config)});`;
}
