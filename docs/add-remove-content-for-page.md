# Adding Content Removal Scripts

This guide explains how to add new content removal (debloating) scripts to remove unwanted elements from websites.

## Overview

Content removal scripts hide or delete DOM elements from web pages. Examples:
- Remove YouTube Shorts
- Hide promotional banners
- Remove recommended content sections

## Step-by-Step Guide

### Step 1: Identify the Target Element

Use your browser's Developer Tools (F12) to inspect the element you want to remove:

1. **Right-click** the element → **Inspect**
2. Look for unique selectors:
   - CSS class names (e.g., `.shorts-shelf`)
   - Data attributes (e.g., `[data-component="shorts"]`)
   - ID attributes (e.g., `#shorts-button`)
   - Complex selectors (e.g., `ytd-rich-shelf-renderer[is-shorts]`)

**Example:** To remove YouTube Shorts button:
```css
ytd-mini-guide-entry-renderer:has(a[href*="/shorts"])
```

### Step 2: Add Selector to Configuration

**File:** `config/selectors.json`

Add your selector under the appropriate site and category:

```json
{
  "version": "1.0.3",
  "lastUpdated": "2026-03-25",
  "selectors": {
    "youtube": {
      "shorts": {
        "button": [
          { "selector": "ytd-mini-guide-entry-renderer:has(a[href*=\"/shorts\"])", "type": "css" }
        ],
        "home": [
          { "selector": "ytd-browse[page-subtype='home'] ytd-rich-shelf-renderer[is-shorts]", "type": "css" }
        ]
      },
      "recommendations": {
        "endScreen": [
          { "selector": "ytd-watch-next-secondary-results-renderer", "type": "css" }
        ]
      }
    }
  }
}
```

**Selector format:**
- Simple: `"ytd-mini-guide-entry-renderer"`
- With type: `{ "selector": "...", "type": "css" }`
- Multiple: Array of selectors

**Types:**
- `"css"` - CSS selector (most common)
- `"xpath"` - XPath selector
- `"id"` - Element ID

### Step 3: Create the Script File

**Location:** `src/content-scripts/{site}/remove/{category}/{scriptName}.ts`

**Example:** `src/content-scripts/youtube/remove/recommendations/hideEndScreen.ts`

```typescript
/**
 * Hide End Screen Recommendations
 * Removes recommended videos shown at the end of videos
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

const APP_NAME = 'YouTube';
const SCRIPT_ID = 'hideEndScreen';

(function() {
  'use strict';

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Get selectors from storage
  // Path matches selectors.json: youtube.recommendations.endScreen
  const SELECTORS = window.Debloater.getSelectors('youtube.recommendations.endScreen');

  // Initial removal
  const removed = window.Debloater.deleteElements(SELECTORS);
  if (removed > 0) {
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} end screen elements`);
  }

  // Observe for dynamic changes (YouTube is a SPA)
  if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SELECTORS);
  }

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Active`);
})();
```

**Key points:**
- Path in `getSelectors()` matches `selectors.json` structure (dot notation)
- Use `deleteElements()` for initial removal
- Use `observeAndRemove()` for SPAs that load content dynamically
- Wrap in IIFE `(function() { ... })()` to avoid global scope pollution

### Step 4: Register the Script

**File:** `config/scripts.ts`

Add your script to the appropriate site's configuration:

```typescript
export const SCRIPTS_CONFIG: SiteConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    urlPatternBase: 'youtube\\..*',
    defaultScripts: [
      // Existing scripts...
      {
        id: 'hideEndScreen',  // Unique ID (camelCase)
        name: 'Hide End Screen Recommendations',  // Display name
        description: 'Remove recommended videos shown at the end of videos',
        scriptPath: 'youtube/remove/recommendations/hideEndScreen.js',  // .js not .ts!
        defaultEnabled: true,  // Enabled by default
        type: 'removal',  // 'removal' for content removal
      },
    ],
    pathScripts: [
      // Scripts that run only on specific URL patterns
      {
        id: 'hideWatchPageSidebar',
        name: 'Hide Watch Page Sidebar',
        description: 'Remove sidebar recommendations on video watch pages',
        scriptPath: 'youtube/remove/recommendations/hideSidebar.js',
        urlPattern: 'youtube\\..*/watch.*',  // Regex pattern for URL
        type: 'removal',
        defaultEnabled: false,
      },
    ],
  },
];
```

**defaultScripts vs pathScripts:**
- `defaultScripts` - Run on **all pages** of the site
- `pathScripts` - Run only when URL matches `urlPattern` regex

**Important:**
- `scriptPath` uses `.js` extension (TypeScript is compiled to JavaScript)
- `id` must be unique across all scripts
- `urlPattern` is a regex string (escape dots with `\\.`)

### Step 5: Create the Settings Page Component

**Location:** `src/webpage/content-pages/{site}.tsx`

Create a React component that displays the settings UI for your site:

**Example:** `src/webpage/content-pages/youtube.tsx`

```tsx
import { Button } from '@/webpage/components/ui/button';
import { SCRIPTS_CONFIG } from '@config/scripts';
import { useSettings } from '@/webpage/hooks/useSettings';
import { cn } from '@/webpage/lib/utils';
import { Trash2, Sparkles, Save } from 'lucide-react';
import { SiteIcon } from '@/webpage/components/SiteIcon';
import { RenderScriptGroup } from '@/webpage/components/RenderScriptGroup';

const SITE_ID = 'youtube';

export function YouTubePage() {
  const {
    versions,
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  const site = SCRIPTS_CONFIG.find(s => s.id === SITE_ID);
  
  if (!site) {
    return <div>Site configuration not found</div>;
  }

  const allScripts = [...site.defaultScripts, ...site.pathScripts];
  const siteHasPendingChanges = hasPendingChanges(site.id);

  // Group scripts by type
  const removalScripts = allScripts.filter(s => s.type === 'removal');
  const enhancementScripts = allScripts.filter(s => s.type === 'enhancement');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-red-500/10 to-red-600/5",
              "ring-1 ring-red-500/20"
            )}>
              <SiteIcon siteId="youtube" size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{site.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage {allScripts.length} script{allScripts.length !== 1 ? 's' : ''} 
                {removalScripts.length > 0 && \` • \${removalScripts.length} removal\${removalScripts.length !== 1 ? 's' : ''}\`}
                {enhancementScripts.length > 0 && \` • \${enhancementScripts.length} enhancement\${enhancementScripts.length !== 1 ? 's' : ''}\`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <RenderScriptGroup
            scripts={removalScripts}
            title="Remove Content"
            icon={<Trash2 className="w-4 h-4" />}
            accentColor="red"
            siteId={site.id}
            versions={versions}
            getCurrentSetting={getCurrentSetting}
            handleSettingChange={handleSettingChange}
          />
          <RenderScriptGroup
            scripts={enhancementScripts}
            title="Enhancements"
            icon={<Sparkles className="w-4 h-4" />}
            accentColor="blue"
            siteId={site.id}
            versions={versions}
            getCurrentSetting={getCurrentSetting}
            handleSettingChange={handleSettingChange}
          />
        </div>
      </div>

      {/* Apply Button */}
      {siteHasPendingChanges && (
        <div className={cn(
          "sticky bottom-0 border-t bg-card/95 backdrop-blur-sm",
          "shadow-2xl shadow-black/10"
        )}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Unsaved changes
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isExtension 
                    ? 'Changes will be applied and active tabs will be refreshed'
                    : 'Apply button is disabled in development mode'}
                </p>
              </div>
              <Button 
                onClick={() => handleApplyChanges(site.id, site.name)}
                disabled={!isExtension}
                size="lg"
                className={cn(
                  "gap-2 shadow-lg transition-all duration-200",
                  "hover:shadow-xl hover:scale-105"
                )}
              >
                <Save className="w-4 h-4" />
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Key components:**
- `RenderScriptGroup` - Reusable component that displays grouped scripts
- `useSettings` - Hook for managing script settings
- `SiteIcon` - Displays the site's icon
- Header, Content, Apply Button sections

### Step 6: Register the Page in Router

**File:** `src/webpage/components/layout/MainLayout/MainLayout.tsx`

Add your new page to the PAGES array:

```tsx
import { YouTubePage } from '@/webpage/content-pages/youtube';

const PAGES: PagesInterface[] = [
  {
    id: 'home',
    element: <Home />,
    path: '/'
  },
  {
    id: 'youtube',
    element: <YouTubePage />,
    path: '/site/youtube'
  },
  // Add your new site here...
];
```

Now the page will appear in the sidebar navigation automatically!

### Step 7: Build the Extension

The TypeScript files need to be compiled to JavaScript:

```bash
npm run build
# or for development
npm run dev
```

This compiles `hideEndScreen.ts` → `hideEndScreen.js` in the `dist/` folder.

### Step 8: Test Your Script

#### 8.1 Load Extension in Browser

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `dist/manifest.json`

#### 8.2 Test the Removal

1. Navigate to the target page (e.g., YouTube video)
2. Open Developer Console (F12)
3. Look for your log messages:
   ```
   [YouTube][hideEndScreen] Initializing...
   [YouTube][hideEndScreen] Removed 2 end screen elements
   [YouTube][hideEndScreen] Active
   ```
4. **Verify:** The target elements should be hidden/removed

#### 8.3 Test Settings Toggle

1. Open extension settings page
2. Find your script in the YouTube section under "Remove Content"
3. Toggle it off → element should reappear (after page reload)
4. Toggle it on → element should be removed

### Step 9: Handle Dynamic Content

For Single Page Applications (SPAs) like YouTube, content loads dynamically without page reloads.

**Use `observeAndRemove()`** to continuously watch for new elements:

```typescript
// This handles dynamically loaded content
window.Debloater.observeAndRemove(SELECTORS);
```

**How it works:**
- Uses `MutationObserver` to watch DOM changes
- Automatically removes matching elements when they appear
- Stops when script is disabled

### Common Patterns

#### Pattern 1: Multiple Selectors

```json
{
  "selectors": {
    "youtube": {
      "ads": {
        "all": [
          { "selector": ".ytd-display-ad-renderer", "type": "css" },
          { "selector": "ytd-promoted-sparkles-web-renderer", "type": "css" },
          { "selector": "#player-ads", "type": "id" }
        ]
      }
    }
  }
}
```

#### Pattern 2: URL-Specific Removal

For content that only appears on specific pages:

```typescript
// In config/scripts.ts
pathScripts: [
  {
    id: 'hideSearchAds',
    name: 'Hide Search Ads',
    description: 'Remove ads from search results',
    scriptPath: 'youtube/remove/ads/hideSearchAds.js',
    urlPattern: 'youtube\\..*/results.*',  // Only on /results pages
    type: 'removal',
    defaultEnabled: true,
  },
]
```

#### Pattern 3: Conditional Removal

```typescript
(function() {
  'use strict';

  if (!window.Debloater) return;

  // Only remove if user is not logged in
  if (document.querySelector('[aria-label="Sign in"]')) {
    const SELECTORS = window.Debloater.getSelectors('youtube.ads.loggedOut');
    window.Debloater.deleteElements(SELECTORS);
    window.Debloater.observeAndRemove(SELECTORS);
  }
})();
```

## Troubleshooting

### Script not running
- ✅ Check console for errors
- ✅ Verify script is enabled in settings
- ✅ Check URL pattern matches current page
- ✅ Rebuild extension: `npm run build`
- ✅ Reload extension in browser

### Elements not removed
- ✅ Verify selector in DevTools: `document.querySelector('your-selector')`
- ✅ Check selector path in `getSelectors()` matches `selectors.json`
- ✅ For dynamic content, ensure `observeAndRemove()` is called
- ✅ Check element loads after script runs (timing issue)

### Settings toggle not working
- ✅ Verify `id` in `config/scripts.ts` is unique
- ✅ Rebuild extension after config changes
- ✅ Clear extension storage: Chrome DevTools → Application → Storage

## Best Practices

1. **Specific selectors** - Use the most specific selector possible to avoid removing wrong elements
2. **Test thoroughly** - Test on multiple pages and scenarios
3. **Document well** - Add clear comments explaining what and why
4. **Performance** - Avoid overly broad selectors that match many elements
5. **Default state** - Set `defaultEnabled: false` for aggressive removals
6. **Naming** - Use descriptive IDs and names that explain the purpose

## Example: Complete Removal Script

**Scenario:** Remove YouTube's "Create" button from the header

**1. Selector (in `config/selectors.json`):**
```json
{
  "youtube": {
    "header": {
      "createButton": [
        { "selector": "ytd-topbar-menu-button-renderer:has(a[href*=\"/upload\"])", "type": "css" }
      ]
    }
  }
}
```

**2. Script (in `src/content-scripts/youtube/remove/header/hideCreateButton.ts`):**
```typescript
/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';
  
  if (!window.Debloater) return;
  
  const SELECTORS = window.Debloater.getSelectors('youtube.header.createButton');
  window.Debloater.deleteElements(SELECTORS);
  window.Debloater.observeAndRemove(SELECTORS);
})();
```

**3. Config (in `config/scripts.ts`):**
```typescript
defaultScripts: [
  {
    id: 'hideCreateButton',
    name: 'Hide Create Button',
    description: 'Remove the "Create" button from YouTube header',
    scriptPath: 'youtube/remove/header/hideCreateButton.js',
    defaultEnabled: false,
    type: 'removal',
  },
]
```

**4. Build and test:**
```bash
npm run build
# Load extension and verify button is removed
```

---

## Next Steps

- Learn about [Adding Enhancements](./add-enhancement-for-page.md)
- See existing examples in `src/content-scripts/`
- Check `core/dom-utils.ts` for available helper functions
