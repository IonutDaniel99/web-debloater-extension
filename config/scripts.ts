/**
 * Sites Configuration
 * 
 * Defines sites, URL patterns, and scripts to inject.
 * Scripts are only injected if enabled in global settings.
 */

export interface ScriptConfig {
  id: string; // Unique script ID (used in settings)
  name: string; // Display name
  description: string; // What the script does
  scriptPath: string; // Path relative to content-scripts/
  defaultEnabled: boolean; // Default enabled state
  type: 'enhancement' | 'removal'; // Type of script (for UI categorization)
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
        type: 'removal',
      },
    ],
    pathScripts: [
      {
        id: 'hideShortsHome',
        name: 'Hide Shorts Shelf (Home)',
        description: 'Remove Shorts shelf from YouTube home page',
        scriptPath: 'youtube/remove/shorts/hideShortsHome.js',
        urlPattern: 'youtube\\.com/?$',
        type: 'removal',
        defaultEnabled: true,
      },
      {
        id: 'hideShortsSubscriptions',
        name: 'Hide Shorts Shelf (Subscriptions)',
        description: 'Remove shorts shelves from subscriptions pages',
        scriptPath: 'youtube/remove/shorts/hideShortsSubscriptions.js',
        urlPattern: 'youtube\\..*/feed/.*',
        type: 'removal',
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
        type: 'enhancement',
      },
    ],
    pathScripts: [],
  },
];


