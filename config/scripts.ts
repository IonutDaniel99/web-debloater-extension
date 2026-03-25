/**
 * Sites Configuration
 * 
 * Defines sites, URL patterns, and scripts to inject.
 * Scripts are only injected if enabled in global settings.
 */

import { ENV } from './env';

/**
 * Remote Selectors URL
 * Loaded from .env file (VITE_SELECTORS_URL)
 */
export const SELECTORS_URL = ENV.SELECTORS_URL;

export interface ScriptConfig {
  id: string; // Unique script ID (used in settings)
  name: string; // Display name
  description: string; // What the script does
  scriptPath: string; // Path relative to content-scripts/
  defaultEnabled: boolean; // Default enabled state
}

export interface PathScript extends ScriptConfig {
  urlPattern: string; // URL pattern regex for this specific path
}

export interface SiteConfig {
  id: string; // Site ID (e.g., "youtube")
  name: string; // Display name
  icon?: string; // Optional emoji icon for UI
  urlPatternBase: string; // Base URL pattern regex (e.g., "youtube\\..*")
  defaultScripts: ScriptConfig[]; // Scripts to run on all pages of this site
  pathScripts: PathScript[]; // Scripts to run on specific paths
}

export const SCRIPTS_CONFIG: SiteConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    urlPatternBase: 'youtube\\..*',
    defaultScripts: [
      {
        id: 'hideShortsButton',
        name: 'Hide Shorts Button',
        description: 'Remove the "Shorts" button from YouTube navigation',
        scriptPath: 'youtube/remove/shorts/hideShortsButton.js',
        defaultEnabled: true,
      },
    ],
    pathScripts: [
      {
        id: 'hideShortsHome',
        name: 'Hide Shorts Shelf (Home)',
        description: 'Remove Shorts shelf from YouTube home page',
        scriptPath: 'youtube/remove/shorts/hideShortsHome.js',
        urlPattern: 'youtube\\.com/?$',
        defaultEnabled: true,
      },
      {
        id: 'hideShortsSubscriptions',
        name: 'Hide Shorts Shelf (Subscriptions)',
        description: 'Remove shorts shelves from subscriptions pages',
        scriptPath: 'youtube/remove/shorts/hideShortsSubscriptions.js',
        urlPattern: 'youtube\\..*/feed/.*',
        defaultEnabled: true,
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    urlPatternBase: 'github\\.com',
    defaultScripts: [
      {
        id: 'goToTop',
        name: 'Go to Top Button',
        description: 'Add floating "Go to Top" button on all GitHub pages',
        scriptPath: 'github/add/goToTopButton.js',
        defaultEnabled: true,
      },
    ],
    pathScripts: [],
  },
];

/**
 * Get scripts that should run for a given URL
 */
export function getScriptsForURL(url: string): {
  siteId: string;
  scripts: Array<{ id: string; scriptPath: string }>;
} | null {
  for (const site of SCRIPTS_CONFIG) {
    // Check if URL matches site's base pattern
    if (!matchesPattern(url, site.urlPatternBase)) continue;

    const scriptsToRun: Array<{ id: string; scriptPath: string }> = [];
    
    // Always add default scripts
    site.defaultScripts.forEach(script => {
      scriptsToRun.push({ id: script.id, scriptPath: script.scriptPath });
    });
    
    // Add path-specific scripts if URL matches
    site.pathScripts.forEach(script => {
      if (matchesPattern(url, script.urlPattern)) {
        scriptsToRun.push({ id: script.id, scriptPath: script.scriptPath });
      }
    });

    return { 
      siteId: site.id,
      scripts: scriptsToRun 
    };
  }

  return null;
}

/**
 * Simple regex pattern matching
 */
function matchesPattern(url: string, pattern: string): boolean {
  try {
    return new RegExp(pattern, 'i').test(url);
  } catch {
    return false;
  }
}
