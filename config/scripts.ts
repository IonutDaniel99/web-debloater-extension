/**
 * URL-to-Scripts Mapping Configuration
 * 
 * Maps URL patterns to scripts that should run on matching pages.
 * Scripts are only injected if enabled in user settings.
 */

export interface ScriptDefinition {
  id: string; // Unique script ID (used in settings)
  name: string; // Display name
  description: string; // What the script does
  path: string; // Path relative to content-scripts/ (e.g., "youtube/reels/hideReelsButton.js")
  defaultEnabled: boolean; // Default enabled state
}

export interface URLMapping {
  pattern: string; // URL pattern (supports wildcards)
  scripts: string[]; // Script IDs to run on this URL
}

export interface SiteScripts {
  id: string; // Site ID
  name: string; // Site name
  icon: string; // Emoji
  urlBase: string; // Base URL pattern for entire site
  sharedScript?: string; // Path to shared utilities
  scripts: ScriptDefinition[]; // All available scripts for this site
  urlMappings: URLMapping[]; // URL patterns → script IDs
}

export const SCRIPTS_CONFIG: SiteScripts[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    urlBase: '*://*.youtube.com/*',
    // No shared script - each script is self-contained
    scripts: [
      {
        id: 'hideReelsButton',
        name: 'Hide Shorts Button',
        description: 'Remove the "Shorts" button from YouTube navigation',
        path: 'youtube/reels/hideReelsButton.js',
        defaultEnabled: true,
      },
      {
        id: 'hideReelsShelf',
        name: 'Hide Reels Shelf',
        description: 'Remove reels/shorts shelves from pages',
        path: 'youtube/reels/hideReelsShelf.js',
        defaultEnabled: true,
      },
      {
        id: 'hideShortsLinks',
        name: 'Hide Shorts Videos',
        description: 'Remove individual shorts videos from feeds',
        path: 'youtube/shorts/hideShortsLinks.js',
        defaultEnabled: true,
      },
    ],
    urlMappings: [
      {
        pattern: '*://*.youtube.com/',
        scripts: ['hideReelsButton', 'hideReelsShelf'],
      },
      {
        pattern: '*://*.youtube.com/feed/*',
        scripts: ['hideReelsButton', 'hideReelsShelf', 'hideShortsLinks'],
      },
      {
        pattern: '*://*.youtube.com/results*',
        scripts: ['hideReelsButton', 'hideReelsShelf', 'hideShortsLinks'],
      },
      {
        pattern: '*://*.youtube.com/watch*',
        scripts: ['hideReelsButton'],
      },
      {
        pattern: '*://*.youtube.com/*',
        scripts: ['hideReelsButton'], // Fallback: at least hide button everywhere
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    urlBase: '*://*.github.com/*',
    // No shared script - each script is self-contained
    scripts: [
      {
        id: 'goToTop',
        name: 'Go to Top Button',
        description: 'Add floating "Go to Top" button on long pages',
        path: 'github/pulls.js', // Reusing existing for now
        defaultEnabled: true,
      },
    ],
    urlMappings: [
      {
        pattern: '*://*.github.com/*/*/pull/*',
        scripts: ['goToTop'],
      },
    ],
  },
];

/**
 * Get scripts that should run for a given URL
 */
export function getScriptsForURL(url: string): { site: SiteScripts; scriptIds: string[] } | null {
  for (const site of SCRIPTS_CONFIG) {
    // Check if URL matches site's base pattern
    if (!matchesPattern(url, site.urlBase)) continue;

    // Find matching URL mappings (most specific first)
    const scriptIds = new Set<string>();
    
    // Sort mappings by specificity (longer patterns = more specific)
    const sortedMappings = [...site.urlMappings].sort(
      (a, b) => b.pattern.length - a.pattern.length
    );

    for (const mapping of sortedMappings) {
      if (matchesPattern(url, mapping.pattern)) {
        mapping.scripts.forEach(id => scriptIds.add(id));
        break; // Use most specific match
      }
    }

    return { site, scriptIds: Array.from(scriptIds) };
  }

  return null;
}

/**
 * Simple glob pattern matching
 */
function matchesPattern(url: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${regexPattern}$`).test(url);
}
