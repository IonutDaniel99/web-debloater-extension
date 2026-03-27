/**
 * Predefined Actions Library
 * 
 * Bundled actions that can be called by data-driven enhancements.
 * This is Chrome Web Store compliant - all code is bundled, only the
 * ACTION NAME comes from remote config.
 * 
 * To add a new action:
 * 1. Add the function to PREDEFINED_ACTIONS object
 * 2. Update the TypeScript interface below
 * 3. Document it in the remote config schema
 * 
 * Actions are injected into the global scope as window.__PREDEFINED_ACTIONS__
 */

export interface PredefinedActions {
  // Navigation
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToElement: (selector: string) => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  
  // Clipboard
  copyToClipboard: (text: string) => void;
  copyCurrentURL: () => void;
  copyPageTitle: () => void;
  
  // Media
  playPause: () => void;
  rewindVideo: (seconds?: number) => void;
  forwardVideo: (seconds?: number) => void;
  toggleFullscreen: () => void;
  toggleMute: () => void;
  
  // UI
  toggleElement: (selector: string) => void;
  focusElement: (selector: string) => void;
  clickElement: (selector: string) => void;
  
  // Utilities
  printPage: () => void;
  openInNewTab: (url: string) => void;
  downloadCurrentPage: () => void;
}

/**
 * Implementation of predefined actions
 */
export const PREDEFINED_ACTIONS: PredefinedActions = {
  // ===== NAVIGATION =====
  
  scrollToTop: () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  scrollToBottom: () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  },

  scrollToElement: (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.warn(`[PredefinedActions] Element not found: ${selector}`);
    }
  },

  goBack: () => {
    window.history.back();
  },

  goForward: () => {
    window.history.forward();
  },

  reload: () => {
    window.location.reload();
  },

  // ===== CLIPBOARD =====

  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('[PredefinedActions] Copied to clipboard:', text);
    } catch (error) {
      console.error('[PredefinedActions] Failed to copy:', error);
    }
  },

  copyCurrentURL: async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      console.log('[PredefinedActions] URL copied to clipboard');
    } catch (error) {
      console.error('[PredefinedActions] Failed to copy URL:', error);
    }
  },

  copyPageTitle: async () => {
    try {
      await navigator.clipboard.writeText(document.title);
      console.log('[PredefinedActions] Page title copied to clipboard');
    } catch (error) {
      console.error('[PredefinedActions] Failed to copy title:', error);
    }
  },

  // ===== MEDIA =====

  playPause: () => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    } else {
      console.warn('[PredefinedActions] No video element found');
    }
  },

  rewindVideo: (seconds = 10) => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.currentTime = Math.max(0, video.currentTime - seconds);
    } else {
      console.warn('[PredefinedActions] No video element found');
    }
  },

  forwardVideo: (seconds = 10) => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.currentTime = Math.min(video.duration, video.currentTime + seconds);
    } else {
      console.warn('[PredefinedActions] No video element found');
    }
  },

  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('[PredefinedActions] Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  },

  toggleMute: () => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.muted = !video.muted;
    } else {
      console.warn('[PredefinedActions] No video element found');
    }
  },

  // ===== UI =====

  toggleElement: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.style.display = element.style.display === 'none' ? '' : 'none';
    } else {
      console.warn(`[PredefinedActions] Element not found: ${selector}`);
    }
  },

  focusElement: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    } else {
      console.warn(`[PredefinedActions] Element not found: ${selector}`);
    }
  },

  clickElement: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.click();
    } else {
      console.warn(`[PredefinedActions] Element not found: ${selector}`);
    }
  },

  // ===== UTILITIES =====

  printPage: () => {
    window.print();
  },

  openInNewTab: (url: string) => {
    window.open(url, '_blank');
  },

  downloadCurrentPage: () => {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title || 'page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

/**
 * Inject predefined actions into window scope
 * This is called by the service worker before injecting enhancement scripts
 */
export function injectPredefinedActions() {
  (window as any).__PREDEFINED_ACTIONS__ = PREDEFINED_ACTIONS;
  console.log('[PredefinedActions] Injected into window scope');
}

/**
 * Get the injectable script as a string
 */
export function getPredefinedActionsInjectable(): string {
  return `
    (function() {
      ${PREDEFINED_ACTIONS.scrollToTop.toString()}
      ${PREDEFINED_ACTIONS.scrollToBottom.toString()}
      ${PREDEFINED_ACTIONS.scrollToElement.toString()}
      ${PREDEFINED_ACTIONS.goBack.toString()}
      ${PREDEFINED_ACTIONS.goForward.toString()}
      ${PREDEFINED_ACTIONS.reload.toString()}
      ${PREDEFINED_ACTIONS.copyToClipboard.toString()}
      ${PREDEFINED_ACTIONS.copyCurrentURL.toString()}
      ${PREDEFINED_ACTIONS.copyPageTitle.toString()}
      ${PREDEFINED_ACTIONS.playPause.toString()}
      ${PREDEFINED_ACTIONS.rewindVideo.toString()}
      ${PREDEFINED_ACTIONS.forwardVideo.toString()}
      ${PREDEFINED_ACTIONS.toggleFullscreen.toString()}
      ${PREDEFINED_ACTIONS.toggleMute.toString()}
      ${PREDEFINED_ACTIONS.toggleElement.toString()}
      ${PREDEFINED_ACTIONS.focusElement.toString()}
      ${PREDEFINED_ACTIONS.clickElement.toString()}
      ${PREDEFINED_ACTIONS.printPage.toString()}
      ${PREDEFINED_ACTIONS.openInNewTab.toString()}
      ${PREDEFINED_ACTIONS.downloadCurrentPage.toString()}
      
      window.__PREDEFINED_ACTIONS__ = {
        scrollToTop: ${PREDEFINED_ACTIONS.scrollToTop.toString()},
        scrollToBottom: ${PREDEFINED_ACTIONS.scrollToBottom.toString()},
        scrollToElement: ${PREDEFINED_ACTIONS.scrollToElement.toString()},
        goBack: ${PREDEFINED_ACTIONS.goBack.toString()},
        goForward: ${PREDEFINED_ACTIONS.goForward.toString()},
        reload: ${PREDEFINED_ACTIONS.reload.toString()},
        copyToClipboard: ${PREDEFINED_ACTIONS.copyToClipboard.toString()},
        copyCurrentURL: ${PREDEFINED_ACTIONS.copyCurrentURL.toString()},
        copyPageTitle: ${PREDEFINED_ACTIONS.copyPageTitle.toString()},
        playPause: ${PREDEFINED_ACTIONS.playPause.toString()},
        rewindVideo: ${PREDEFINED_ACTIONS.rewindVideo.toString()},
        forwardVideo: ${PREDEFINED_ACTIONS.forwardVideo.toString()},
        toggleFullscreen: ${PREDEFINED_ACTIONS.toggleFullscreen.toString()},
        toggleMute: ${PREDEFINED_ACTIONS.toggleMute.toString()},
        toggleElement: ${PREDEFINED_ACTIONS.toggleElement.toString()},
        focusElement: ${PREDEFINED_ACTIONS.focusElement.toString()},
        clickElement: ${PREDEFINED_ACTIONS.clickElement.toString()},
        printPage: ${PREDEFINED_ACTIONS.printPage.toString()},
        openInNewTab: ${PREDEFINED_ACTIONS.openInNewTab.toString()},
        downloadCurrentPage: ${PREDEFINED_ACTIONS.downloadCurrentPage.toString()},
      };
      
      console.log('[PredefinedActions] Injected into window scope');
    })();
  `;
}
