# Web Debloater & Enhancer Extension

Chrome extension for removing unwanted elements from websites using dynamic, auto-updating selectors.

## Features

- 🎯 **Dynamic Selectors** - Update selectors without releasing new extension versions
- 🔄 **Auto-Updates** - Selectors update automatically every 24 hours
- 📦 **Bundled Fallback** - Works offline with bundled selectors
- ⚙️ **Per-Site Settings** - Enable/disable features for each website
- 🎯 **Smart Tab Refresh** - Only refreshes tabs for the site whose settings changed
- 🛠️ **Type-Safe** - Full TypeScript support with multiple selector formats (CSS, XPath, ID, Class)

**Currently Supports:**
- YouTube (Hide Shorts button, shelf on home/subscriptions)
- GitHub (Go to top button on PR pages)
- Instagram (Remove home profile container)

## 📚 Documentation

- **[Changelog](./CHANGELOG.md)** - Detailed change history and version notes
- **[Migration Guide](./MIGRATION.md)** - Upgrading from older versions
- **[Developer Docs](./docs/)** - Guides for adding sites and features

---

## Installation

### Prerequisites

- Node.js 18+
- Chrome/Edge/Brave browser

### Steps

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/web-debloater-extension
cd web-debloater-extension

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set VITE_SELECTORS_URL to your selectors.json URL

# 4. Build extension
npm run build

# 5. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the dist/ folder
```

---

## Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Selector Update URL
VITE_SELECTORS_URL=https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/selectors.json

# Update check interval (hours)
VITE_UPDATE_INTERVAL_HOURS=24

# Alarm name for Chrome alarms
VITE_ALARM_NAME=selector-update-check
```

**Required:**
- `VITE_SELECTORS_URL` - URL to your remote `selectors.json` file

**Optional:**
- `VITE_UPDATE_INTERVAL_HOURS` - Default: 24
- `VITE_ALARM_NAME` - Default: selector-update-check

### 1. Set Up Remote Selectors (Required)

### 1. Set Up Remote Selectors (Required)

**Option A: GitHub (Recommended)**

1. Create a public repository (e.g., `debloater-selectors`)
2. Upload `config/selectors.json`:

```bash
git init
git add config/selectors.json
git commit -m "Add selectors"
git remote add origin https://github.com/YOUR_USERNAME/debloater-selectors.git
git push -u origin main
```

3. Update `.env`:
```bash
VITE_SELECTORS_URL=https://raw.githubusercontent.com/YOUR_USERNAME/debloater-selectors/main/selectors.json
```

**Option B: Your Own Server**

1. Upload `config/selectors.json` to your server
2. Update `.env`:
```bash
VITE_SELECTORS_URL=https://your-domain.com/selectors.json
```

**Option C: Skip Remote (Local Only)**

Leave default URL - extension will use bundled selectors only (no auto-updates).

---

## Build Commands

```bash
# Development build (with hot reload)
npm run dev

# Production build
npm run build

# Type check only
npm run type-check

# Update version number
npm run version:update
```

---

## Project Structure

```
config/
  ├── scripts.ts          # Site and script configuration
  └── selectors.json      # Bundled selectors (updated remotely)

src/
  ├── background/
  │   └── service-worker.ts     # Background script
  ├── content-scripts/
  │   ├── youtube/              # YouTube scripts
  │   └── github/               # GitHub scripts
  ├── core/
  │   ├── dom-utils.ts          # DOM manipulation utilities
  │   ├── selector-manager.ts   # Selector storage/updates
  │   ├── script-injector.ts    # Script injection logic
  │   ├── storage-manager.ts    # Settings storage
  │   ├── update-checker.ts     # Update checking
  │   └── version-manager.ts    # Version comparison
  └── webpage/
      └── App.tsx               # Web page UI

public/
  └── manifest.json             # Extension manifest

dist/                           # Build output (load this in Chrome)
```

---

## Selector System

### Selector Format

Selectors are stored in `config/selectors.json` with three supported formats:

```json
{
  "version": "1.0.0",
  "selectors": {
    "youtube": {
      "shorts": {
        "button": "ytd-mini-guide-entry-renderer:has(a[href*=\"/shorts\"])",
        "home": [
          "ytd-rich-shelf-renderer",
          "ytd-rich-shelf-renderer[is-shorts]"
        ],
        "subscriptions": [
          "ytd-reel-shelf-renderer",
          { "selector": "shorts-shelf", "type": "id" },
          { "selector": "x1dr59a3 x13vifvy x7vhb2i", "type": "class" }
        ]
      }
    }
  }
}
```

**Format Types:**

1. **String** - Single CSS selector
2. **Array** - Multiple CSS selectors
3. **Object** - Selector with type (css/xpath/id/class)
   - `css` - CSS selector (default)
   - `xpath` - XPath expression
   - `id` - Element ID
   - `class` - Space-separated class names (e.g., "x1dr59a3 x13vifvy x7vhb2i")

### Using Selectors in Scripts

**For Removing Elements:**
```typescript
// Content script - Remove elements
const selectors = window.Debloater.getSelectors('youtube.shorts.button');
window.Debloater.deleteElements(selectors);
window.Debloater.observeAndRemove(selectors); // Auto-remove when they appear
```

**For Adding UI Elements:**
```typescript
// Content script - Add "Go to Top" button
const buttonHTML = `
  <button id="my-button" style="position: fixed; bottom: 20px; right: 20px;">
    ↑ Top
  </button>
`;
window.Debloater.addElements(buttonHTML, 'body', 'append');

// Add click handler
document.getElementById('my-button').onclick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### Updating Selectors

1. **Test selector** on live site:
   ```javascript
   // Browser console
   document.querySelectorAll('YOUR_SELECTOR')
   ```

2. **Update `selectors.json`**:
   ```json
   {
     "version": "1.0.1",  // Increment version
     "selectors": {
       "youtube": {
         "shorts": {
           "home": ["new-selector", "another-selector"]
         }
       }
     }
   }
   ```

3. **Upload to remote URL**

4. **Users get update** automatically within 24h or via manual update

---

## DOM Utilities API

All content scripts have access to `window.Debloater`:

### `getSelectors(path)`
Get selectors by dot-notation path.

```typescript
const selectors = window.Debloater.getSelectors('youtube.shorts.button');
```

### `deleteElements(selectors)`
Remove elements from DOM.

```typescript
window.Debloater.deleteElements(['selector1', 'selector2']);
window.Debloater.deleteElements({ selector: 'id-name', type: 'id' });
```

### `observeAndRemove(selectors, callback?)`
Auto-remove elements as they appear.

```typescript
window.Debloater.observeAndRemove(['selector'], (count) => {
  console.log(`Removed ${count} elements`);
});
```

### `waitForElement(selector, timeout?)`
Wait for element to appear.

```typescript
await window.Debloater.waitForElement('#content');
```

### `addElements(elements, parent?, position?)`
Add elements to DOM.

```typescript
window.Debloater.addElements('<div>Hello</div>', 'body', 'append');
```

---

## Adding New Sites

### 1. Add Site Configuration

Edit `config/scripts.ts`:

```typescript
export const SCRIPTS_CONFIG: SiteConfig[] = [
  // ... existing sites
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    urlPatternBase: 'twitter\\.com',
    sharedScript: 'core/dom-utils.js',
    defaultScripts: [
      {
        id: 'hidePromoted',
        name: 'Hide Promoted Tweets',
        description: 'Remove promoted content',
        scriptPath: 'twitter/hidePromoted.js',
        defaultEnabled: true,
      }
    ],
    pathScripts: []
  }
];
```

### 2. Add Selectors

Edit `config/selectors.json`:

```json
{
  "selectors": {
    "twitter": {
      "promoted": ["div[data-testid='promoted']"]
    }
  }
}
```

### 3. Create Content Script

Create `src/content-scripts/twitter/hidePromoted.ts`:

```typescript
(function() {
  'use strict';
  
  if (!window.Debloater) {
    console.error('Debloater utilities not loaded!');
    return;
  }

  const selectors = window.Debloater.getSelectors('twitter.promoted');
  window.Debloater.deleteElements(selectors);
  window.Debloater.observeAndRemove(selectors);
})();
```

### 4. Update Manifest

Add host permission to `public/manifest.json`:

```json
{
  "host_permissions": [
    "*://*.youtube.com/*",
    "*://*.github.com/*",
    "*://*.twitter.com/*"
  ]
}
```

### 5. Rebuild

```bash
npm run build
```

---

## Development

### File Watching

```bash
npm run dev
```

Changes to React components (web page) hot reload automatically. TypeScript modules require rebuild.

### Debugging

**Service Worker:**
- `chrome://extensions/` → Web Debloater & Enhancer → service worker link
- View background script console

**Content Scripts:**
- Open page (e.g., youtube.com)
- DevTools → Console
- LoEnvironment Variables Not Loading

1. Ensure `.env` file is in project root
2. Variable names must start with `VITE_`
3. Restart dev server after changing `.env`
4. Rebuild: `npm run build`

### ok for `[Debloater]` logs

**Storage:**
- DevTools → Application → Storage → chrome.storage.local
- Check `selectors_data` and settings

---

## Troubleshooting

### Selectors Not Loading

1. Check service worker console for errors
2. Verify `window.__SELECTORS__` exists in page console
3. Check `chrome.storage.local` has `selectors_data`

### Scripts Not Injecting

1. Verify URL patterns in `config/scripts.ts` match the page
2. Check zones are enabled in web page
3. Look for injection errors in service worker console

### Updates Not Working

1. Verify `SELECTORS_URL` is correct and publicly accessible
2. Check version is incremented in remote `selectors.json`
3. Check service worker console for fetch errors
4. Try manual update from web page

### Build Errors

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

---

## Selector Types Reference

```typescript
// TypeScript definitions
export type SelectorType = 'css' | 'xpath' | 'id' | 'class';

export interface SelectorConfig {
  selector: string;
  type?: SelectorType;
}

export type SelectorInput = 
  | string 
  | SelectorConfig 
  | Array<string | SelectorConfig>;
```

**Examples:**

```typescript
// CSS (default)
"ytd-rich-shelf-renderer"

// ID
{ "selector": "content", "type": "id" }

// XPath
{ "selector": "//div[@class='promoted']", "type": "xpath" }

// Class
{ "selector": "x1dr59a3 x13vifvy x7vhb2i", "type": "class" }

// Mixed array
[
  "ytd-shelf",
  { "selector": "content-id", "type": "id" },
  { "selector": "//div[@data-promoted]", "type": "xpath" }
]
```

---

## Publishing

### Chrome Web Store

1. Build production version:
   ```bash
   npm run build
   ```

2. Create ZIP:
   ```bash
   cd dist
   zip -r ../web-debloater.zip .
   ```

3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

### Update Process

1. Update code/selectors
2. Increment version in `package.json`
3. Build and test
4. Upload new version to store
5. For selector-only updates, just update remote `selectors.json`

---

## Changelog

### March 25, 2026 - Instagram Support & Major Improvements

**New Features:**
- ✨ **Instagram Support** - Added full Instagram integration with home profile container removal
- 🎨 **Class Selector Type** - New `class` selector type for multi-class CSS matching (e.g., `"x1dr59a3 x13vifvy x7vhb2i"`)
- 🎯 **Site-Specific Tab Refresh** - Tabs now only refresh for the site whose settings changed (not all tabs)

**Improvements:**
- 🔧 **URL Pattern Matching** - Fixed patterns to properly handle query parameters (e.g., `?theme=dark`)
- 📁 **Project Restructure** - Reorganized `content-scripts/` to `page-scripts/` for better clarity
- ⚡ **Build Optimization** - Simplified Vite config, skip `_config.ts` files from compilation
- 🛠️ **Script Injection** - Fixed injection paths and added proper error handling

**Technical Changes:**
- Added `refreshTabsForSite(siteId)` method for targeted tab reloading
- Updated manifest permissions to include `*://*.instagram.com/*`
- Added web accessible resources for Instagram scripts
- Enhanced selector system with space-separated class name support
- Improved URL regex patterns: `instagram\.com/?(?:\\?.*)?$`

**Files Changed:**
- Added: `src/page-scripts/instagram/` (config and scripts)
- Added: `public/icons/instagram.svg`
- Modified: `src/core/script-injector.ts` (site-specific refresh)
- Modified: `src/core/dom-utils.ts` (class selector type)
- Modified: `vite.config.ts` (build improvements)
- Modified: `public/manifest.json` (Instagram permissions)
- Modified: `config/selectors.json` (class type support)

**Documentation:**
- Added comprehensive guides in `docs/` for adding sites and features
- Updated README with class selector examples
- Added Instagram to supported sites list

---

## License

MIT
