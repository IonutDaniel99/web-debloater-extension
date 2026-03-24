/**
 * Zone configuration for all supported websites
 * 
 * Each site has multiple zones (URL patterns) with independent:
 * - Scripts that modify the page
 * - Version numbers for auto-updates
 * - Settings that users can toggle
 */

export interface ZoneSetting {
  key: string;
  label: string;
  description: string;
  type: 'boolean' | 'select' | 'number';
  default: boolean | string | number;
  options?: string[]; // For select type
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  scriptPath: string; // Path in GitHub repo (e.g., "youtube/reels.js")
  settings: ZoneSetting[];
  hasSharedScript?: boolean; // Whether this zone uses shared.js
}

export interface Site {
  id: string;
  name: string;
  icon: string; // Emoji or icon class
  urlPattern: string; // Chrome match pattern for entire site
  zones: Zone[];
  sharedScriptPath?: string; // Path to shared.js in repo
}

export const SITES_CONFIG: Site[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    urlPattern: '*://*.youtube.com/*',
    sharedScriptPath: 'youtube/shared.js',
    zones: [
      {
        id: 'reels',
        name: 'Reels Removal',
        description: 'Remove YouTube Reels/Shorts from all pages (home, subscriptions, search, etc.)',
        scriptPath: 'youtube/reels.js',
        hasSharedScript: true,
        settings: [
          {
            key: 'enabled',
            label: 'Enable',
            description: 'Enable reels removal',
            type: 'boolean',
            default: true,
          },
          {
            key: 'hideOnHome',
            label: 'Hide on Homepage',
            description: 'Remove reels from YouTube homepage',
            type: 'boolean',
            default: true,
          },
          {
            key: 'hideInSearch',
            label: 'Hide in Search',
            description: 'Remove reels from search results',
            type: 'boolean',
            default: true,
          },
          {
            key: 'hideReelsButtonHome',
            label: 'Hide Reels Button on Homepage',
            description: 'Remove reels button from YouTube homepage',
            type: 'boolean',
            default: true,
          },
        ],
      },
      {
        id: 'subscription',
        name: 'Subscription Feed',
        description: 'Enhancements for subscription feed page',
        scriptPath: 'youtube/subscription.js',
        hasSharedScript: true,
        settings: [
          {
            key: 'enabled',
            label: 'Enable',
            description: 'Enable subscription feed enhancements',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    urlPattern: '*://*.github.com/*',
    sharedScriptPath: 'github/shared.js',
    zones: [
      {
        id: 'pulls',
        name: 'Pull Requests',
        description: 'Enhancements for PR pages',
        scriptPath: 'github/pulls.js',
        hasSharedScript: true,
        settings: [
          {
            key: 'enabled',
            label: 'Enable',
            description: 'Enable PR enhancements',
            type: 'boolean',
            default: true,
          },
          {
            key: 'showGoToTop',
            label: 'Show "Go to Top" Button',
            description: 'Add a floating button to scroll to top',
            type: 'boolean',
            default: true,
          },
        ],
      },
    ],
  },
];

// GitHub repository configuration (update this with your repo URL)
export const GITHUB_REPO_CONFIG = {
  owner: 'YOUR_USERNAME', // Replace with actual GitHub username
  repo: 'YOUR_REPO_NAME', // Replace with actual repo name
  branch: 'main',
  getScriptUrl: (scriptPath: string) =>
    `https://raw.githubusercontent.com/${GITHUB_REPO_CONFIG.owner}/${GITHUB_REPO_CONFIG.repo}/${GITHUB_REPO_CONFIG.branch}/scripts/${scriptPath}`,
  getVersionsUrl: () =>
    `https://raw.githubusercontent.com/${GITHUB_REPO_CONFIG.owner}/${GITHUB_REPO_CONFIG.repo}/${GITHUB_REPO_CONFIG.branch}/versions.json`,
};
