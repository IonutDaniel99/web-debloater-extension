# Web Debloater & Enhancer Extension

Chrome extension for removing clutter and adding enhancements to websites using a data-driven architecture with auto-updating configurations.

## Features

- 🎯 **Data-Driven** - All scripts defined in JSON, no TypeScript files needed
- 🔄 **Auto-Updates** - Scripts update every 6 hours from GitHub (no Chrome Store review)
- 📦 **Generic Engines** - Removal & enhancement engines execute JSON configs
- ⚙️ **Dynamic UI** - Settings page auto-generates from config
- 🛠️ **Remote Deployment** - Push to GitHub, users get updates automatically
- 🎨 **Predefined Actions** - 20+ built-in actions (scroll, copy, toggle, etc.)

**Currently Supports:**
- YouTube (Hide Shorts button, shelf on home/subscriptions)
- GitHub (Go to top button on PR pages)
- Instagram (Remove home profile container)
- WhatsApp Web (Privacy blur controls, remove "Get WhatsApp for Windows")

## 🏗️ Architecture

**Data-Driven System:**
- `config/scripts-config.json` - All script definitions
- `src/engines/` - Generic removal & enhancement engines
- `config.ts` - Central configuration (GitHub URL, update interval, etc.)
- Remote updates via GitHub - no extension rebuild needed

## 📚 Documentation

- **[Docs](./docs/)** - Architecture guides and quick start
- **[Changelog](./CHANGELOG.md)** - Version history
- **[Migration Guide](./MIGRATION.md)** - Upgrading from older versions

---

## Installation

### Prerequisites

- Node.js 18+
- Chrome/Edge/Brave browser

### Steps

```bash
# 1. Clone repository
git clone https://github.com/IonutDaniel99/web-debloater-extension
cd web-debloater-extension

# 2. Install dependencies
npm install

# 3. Edit config.ts (optional)
# Set your GitHub repo URL for remote updates

# 4. Build extension
npm run build

# 5. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the dist/ folder
```

# 5. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the dist/ folder
```

---

## Configuration

All configuration is in `config.ts` (root of project):

```typescript
// Your GitHub repository
export const REMOTE_CONFIG_URL = 
  'https://raw.githubusercontent.com/IonutDaniel99/web-debloater-extension/main/config/scripts-config.json';

// Auto-update interval (hours)
export const AUTO_UPDATE_INTERVAL_HOURS = 6;

// Storage keys
export const STORAGE_KEYS = {
  REMOTE_CONFIG: 'remote_scripts_config',
  REMOTE_CONFIG_VERSION: 'remote_scripts_config_version',
} as const;

// Alarm names
export const ALARMS = {
  REMOTE_CONFIG_UPDATE: 'REMOTE_CONFIG_ALARM',
} as const;
```

**To change GitHub URL:**
Edit `config.ts` and update `REMOTE_CONFIG_URL` to your repository.

**To change update interval:**
Edit `config.ts` and change `AUTO_UPDATE_INTERVAL_HOURS` (default: 6 hours).

### Set Up Remote Updates

**1. Push scripts-config.json to GitHub:**

```bash
git add config/scripts-config.json
git commit -m "Add scripts config"
git push
```

**2. Verify URL in config.ts:**
```typescript
export const REMOTE_CONFIG_URL = 
  'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/config/scripts-config.json';
```

**3. Users get updates automatically:**
- Extension checks for updates every 6 hours
- Users can manually click "Check for Updates"
- No Chrome Store submission needed!

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
config.ts                       # Central configuration
config/
  └── scripts-config.json       # All script definitions

src/
  ├── engines/                  # Generic engines
  │   ├── removal-engine.ts    # Executes removals
  │   ├── enhancement-engine.ts # Executes enhancements
  │   └── predefined-actions.ts # 20+ built-in actions
  ├── core/
  │   ├── remote-config.ts     # Fetch/cache configs
  │   ├── script-injector.ts   # Hybrid injection
  │   ├── service-worker.ts    # Background script
  │   └── storage-manager.ts   # Settings storage
  ├── page-scripts/            # Bundled scripts (complex only)
  │   └── whatsapp/add/privacyBlurControls.ts
  └── webpage/
      ├── pages/
      │   ├── home.tsx
      │   └── DynamicSitePage.tsx  # Dynamic site pages
      └── components/
          └── layout/dynamic-site/

dist/                          # Build output (load this in Chrome)
```

---

## Adding Scripts

### Add Removal Script

Edit `config/scripts-config.json`:

```json
{
  "hideElement": {
    "id": "hideElement",
    "name": "Hide Element Name",
    "description": "Removes element from page",
    "type": "removal",
    "defaultEnabled": true,
    "removal": {
      "selectorPath": "div.unwanted-element",
      "observeChanges": true
    }
  }
}
```

### Add Enhancement - Floating Button

```json
{
  "scrollButton": {
    "id": "scrollButton",
    "name": "Scroll to Top",
    "description": "Adds floating scroll button",
    "type": "enhancement",
    "defaultEnabled": true,
    "enhancement": {
      "enhancementType": "floating-button",
      "floatingButton": {
        "text": "↑ Top",
        "style": {
          "position": "bottom-right",
          "backgroundColor": "#4CAF50"
        },
        "showOnScroll": 300,
        "onClick": "scrollToTop"
      }
    }
  }
}
```

### Add Enhancement - Keyboard Shortcut

```json
{
  "keyboardShortcut": {
    "id": "keyboardShortcut",
    "name": "Scroll Shortcuts",
    "description": "Ctrl+T to scroll to top",
    "type": "enhancement",
    "defaultEnabled": true,
    "enhancement": {
      "enhancementType": "keyboard-shortcut",
      "keyboardShortcut": {
        "keys": "ctrl+t",
        "action": "scrollToTop",
        "preventDefault": true
      }
    }
  }
}
```

### Deploy Changes

```bash
git add config/scripts-config.json
git commit -m "Add new script"
git push

# Users get update automatically within 6 hours
# Or they can click "Check for Updates" button
```

---

## Available Predefined Actions

See `src/engines/predefined-actions.ts`:

- `scrollToTop` - Scroll to page top
- `scrollToBottom` - Scroll to page bottom
- `copyToClipboard` - Copy text to clipboard
- `openInNewTab` - Open URL in new tab
- `toggleDarkMode` - Toggle dark mode
- `printPage` - Print current page
- `downloadPageAsImage` - Save page as image
- `focusSearchBox` - Focus search input
- And 15+ more...

---

## Selector System (Legacy)

> **Note:** Selectors are now part of script configs in `scripts-config.json`

### Testing Selectors

```javascript
// Browser console
document.querySelectorAll('YOUR_SELECTOR')
// Should highlight the elements you want to remove/target
```
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

Edit `config/scripts-config.json` and add a new site entry:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-27",
  "sites": {
    "newsite": {
      "name": "New Site",
      "urlPatternBase": "newsite\\.com",
      "scripts": {
        "hideAds": {
          "id": "hideAds",
          "name": "Hide Ads",
          "description": "Remove ads from site",
          "type": "removal",
          "defaultEnabled": true,
          "removal": {
            "selectorPath": "div.ad-container"
          }
        }
      }
    }
  }
}
```

Then add site icon and update `src/webpage/components/SiteIcon.tsx` if needed.

---

## Development

### File Watching

```bash
npm run dev
```

Changes to React components hot reload automatically.

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
