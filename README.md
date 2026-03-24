# Web Debloater - Chrome Extension

A zone-based, auto-updating Chrome extension for debloating websites and adding custom enhancements.

## Features

- **Zone-Based Architecture**: Each website has multiple zones (feature modules) with independent scripts and settings
- **Site-Level URL Matching**: All zones for a site run on every page (e.g., all YouTube zones run on `*://*.youtube.com/*`)
- **Auto-Updates**: Scripts update automatically from GitHub every 24 hours
- **Per-Zone Versioning**: Each zone has its own version number for granular updates
- **React Options Page**: Modern, expandable UI for managing settings
- **TypeScript Core**: Type-safe core modules for reliability
- **Smart Script Injection**: Scripts decide what to modify based on page content, not URL restrictions

## Supported Sites

### YouTube (`*://*.youtube.com/*`)
- **Reels Removal**: Remove YouTube Reels/Shorts from all pages (home, subscriptions, search, etc.)
- **Subscription Feed**: Enhancements for subscription page

### GitHub (`*://*.github.com/*`)
- **Pull Requests**: "Go to Top" button and other PR enhancements

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure GitHub Repository

Create a public GitHub repository for hosting your zone scripts, then update `config/zones.ts`:

```typescript
export const GITHUB_REPO_CONFIG = {
  owner: 'your-github-username',
  repo: 'your-repo-name',
  branch: 'main',
  // ...
};
```

### 3. Upload Scripts to GitHub

Upload the contents of the `github-repo/` folder to your GitHub repository:
- `scripts/youtube/` - YouTube zone scripts
- `scripts/github/` - GitHub zone scripts
- `versions.json` - Version tracking file

### 4. Build Extension

Development mode with HMR:
```bash
npm run dev
```

Production build:
```bash
npm run build
```

### 5. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## Development

### Project Structure

```
web-debloater-extension/
├── config/
│   ├── scripts.ts            # Sites & scripts configuration
│   └── zones.ts              # Re-exports for Options UI
├── src/
│   ├── background/
│   │   └── service-worker.ts # Background script (24h alarms, updates)
│   ├── core/
│   │   ├── storage-manager.ts   # chrome.storage.local wrapper
│   │   ├── version-manager.ts   # Version comparison logic
│   │   ├── github-fetcher.ts    # Fetch scripts from GitHub
│   │   ├── update-checker.ts    # Update orchestration
│   │   ├── script-injector.ts   # Conditional script injection
│   │   ├── dom-utils.js         # DOM manipulation helpers
│   │   └── bundled-scripts.ts   # Bundled fallback scripts
│   ├── content-scripts/
│   │   ├── youtube/
│   │   │   ├── shared.js        # YouTube utilities
│   │   │   ├── reels.js         # Reels removal
│   │   │   └── subscription.js  # Subscription enhancements
│   │   └── github/
│   │       ├── shared.js        # GitHub utilities
│   │       └── pulls.js         # PR enhancements
│   └── options/
│       ├── options.html         # Options page entry
│       ├── options.tsx         # React entry point
│       ├── App.tsx             # Main React component
│       └── options.css         # Tailwind CSS
├── public/
│   └── manifest.json           # Chrome extension manifest
└── github-repo/                # Template for GitHub repository
    ├── scripts/                # Scripts to upload to GitHub
    └── versions.json           # Version tracking
```

### Adding a New Zone

1. **Create the script file** in `src/content-scripts/{site}/{zone}.js`
2. **Add zone configuration** in `config/zones.ts`:
   ```typescript
   {
     id: 'my-zone',
     name: 'My Zone',
     description: 'Zone description',
     scriptPath: 'site/my-zone.js',
     settings: [
       {
         key: 'enabled',
         label: 'Enable',
         type: 'boolean',
         default: true,
       },
     ],
   }
   ```
   Note: URL matching is now at the site level (e.g., `*://*.youtube.com/*`). Scripts handle page-specific logic internally.

3. **Copy script to GitHub repo template** (`github-repo/scripts/{site}/`)
4. **Update `github-repo/versions.json`** with the new zone version
5. **Rebuild extension** and upload GitHub files

### Updating Zone Scripts

After modifying a zone script:

1. Update the script in `github-repo/scripts/{site}/{zone}.js`
2. Increment version in `github-repo/versions.json`
3. Commit and push to GitHub
4. Users will receive updates within 24 hours (or manually via settings)

## How It Works

### Update Flow

1. **Service Worker** sets a 24-hour alarm on installation
2. Every 24 hours, **Update Checker** fetches `versions.json` from GitHub
3. **Version Manager** compares local vs remote versions
4. If updates available, user is notified via `chrome.notifications`
5. User approves updates in options page
6. **GitHub Fetcher** downloads updated zone scripts
7. **Storage Manager** saves scripts to `chrome.storage.local`
8. **Script Injector** uses updated scripts on next page load

### Script Injection Flow

1. User navigates to a website (e.g., `youtube.com/feed/subscriptions`)
2. **Service Worker** listens for `chrome.tabs.onUpdated`
3. **URL Matcher** determines which site matches the URL (site-level matching)
4. **Script Injector** loads ALL enabled zones for that site
5. Injects `shared.js` if any zone for the site requires it
6. Injects each enabled zone script with settings via `chrome.scripting.executeScript`
7. Zone scripts access settings via `window.__ZONE_SETTINGS__` and handle page-specific logic internally
8. Example: The reels zone checks if current page is home/subscriptions/search and acts accordingly

## Tech Stack

- **Vite**: Build tool with HMR for development
- **React**: Options page UI
- **TypeScript**: Core modules (type-safe)
- **Tailwind CSS**: Styling
- **Vanilla JS**: Content scripts (no build step, downloaded from GitHub)

## License

MIT
