# Adding Enhancement Scripts

This guide explains how to add new enhancement scripts that add features or improve functionality on websites.

## Overview

Enhancement scripts add new UI elements or functionality to web pages. Examples:
- Add "Go to Top" button
- Add keyboard shortcuts
- Add download buttons
- Improve existing features

**Key difference from removal scripts:**
- Enhancements **create** new elements
- Removals **delete** existing elements

## Step-by-Step Guide

### Step 1: Plan Your Enhancement

Determine what you want to add:
- **UI Element?** Button, panel, widget
- **Functionality?** Keyboard shortcut, automation
- **Where?** Fixed position, inline, floating
- **Styling?** Match site design or use custom styles

**Example:** Add a "Go to Top" button on GitHub

### Step 2: Create the Script File

**Location:** `src/content-scripts/{site}/add/{category}/{scriptName}.ts`

**Example:** `src/content-scripts/github/add/navigation/goToTopButton.ts`

```typescript
/**
 * GitHub - Go to Top Button
 * 
 * Adds a floating "Go to Top" button on all GitHub pages.
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  console.log('[GitHub GoToTop] Initializing...');

  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error('[GitHub GoToTop] Debloater utilities not loaded!');
    return;
  }

  /**
   * Add "Go to Top" floating button
   */
  function addGoToTopButton() {
    // Check if button already exists (avoid duplicates)
    if (document.getElementById('gh-goto-top-btn')) {
      console.log('[GitHub GoToTop] Button already exists');
      return;
    }

    // Create button element
    const button = document.createElement('button');
    button.id = 'gh-goto-top-btn';
    button.title = 'Go to Top';
    button.textContent = '↑';
    
    // Apply styles
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#0969da',
      color: 'white',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: '10000',
      display: 'none',
      transition: 'opacity 0.3s, transform 0.3s',
    });

    // Add hover effect
    button.onmouseenter = () => {
      button.style.opacity = '0.8';
      button.style.transform = 'scale(1.1)';
    };
    button.onmouseleave = () => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1)';
    };

    // Click handler - scroll to top
    button.onclick = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Show/hide based on scroll position
    function toggleVisibility() {
      if (window.scrollY > 300) {
        button.style.display = 'block';
      } else {
        button.style.display = 'none';
      }
    }

    // Listen to scroll events
    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Initial check

    // Add button to page
    document.body.appendChild(button);
    console.log('[GitHub GoToTop] Button added');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addGoToTopButton);
  } else {
    addGoToTopButton();
  }

  console.log('[GitHub GoToTop] Active');
})();
```

**Key patterns:**
- Check for duplicates with `getElementById()`
- Use unique IDs to prevent conflicts
- Apply inline styles or inject CSS
- Handle cleanup (remove event listeners if script disabled)
- Use `position: fixed` for floating elements

### Step 3: Register the Script

**File:** `config/scripts.ts`

Add your enhancement to the appropriate site:

```typescript
export const SCRIPTS_CONFIG: SiteConfig[] = [
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
        scriptPath: 'github/add/goToTopButton.js',  // .js not .ts!
        defaultEnabled: true,
        type: 'enhancement',  // 'enhancement' for feature additions
      },
    ],
    pathScripts: [],
  },
];
```

**Important:**
- Set `type: 'enhancement'` (not `'removal'`)
- Script will appear under "Enhancements" section in UI
- Use `.js` extension in `scriptPath`

### Step 4: Create the Settings Page Component (if new site)

If you're adding an enhancement to a **new site** that doesn't have a settings page yet, you need to create one.

**Location:** `src/webpage/content-pages/{site}.tsx`

**Example:** `src/webpage/content-pages/github.tsx`

```tsx
import { Button } from '@/webpage/components/ui/button';
import { SCRIPTS_CONFIG } from '@config/scripts';
import { useSettings } from '@/webpage/hooks/useSettings';
import { cn } from '@/webpage/lib/utils';
import { Trash2, Sparkles, Save } from 'lucide-react';
import { SiteIcon } from '@/webpage/components/SiteIcon';
import { RenderScriptGroup } from '@/webpage/components/RenderScriptGroup';

const SITE_ID = 'github';

export function GitHubPage() {
  const {
    versions,
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  const site = SCRIPTS_CONFIG.find(s => s.id === SITE_ID);
  if (!site) return <div>Site configuration not found</div>;

  const allScripts = [...site.defaultScripts, ...site.pathScripts];
  const siteHasPendingChanges = hasPendingChanges(site.id);
  const removalScripts = allScripts.filter(s => s.type === 'removal');
  const enhancementScripts = allScripts.filter(s => s.type === 'enhancement');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header, Content, and Apply Button - see removal guide for full code */}
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
    </div>
  );
}
```

Then register it in `src/webpage/components/layout/MainLayout/MainLayout.tsx`:

```tsx
import { GitHubPage } from '@/webpage/content-pages/github';

const PAGES: PagesInterface[] = [
  // ... other pages
  {
    id: 'github',
    element: <GitHubPage />,
    path: '/site/github'
  },
];
```

**Note:** If the site already has a settings page (like YouTube), skip this step!

### Step 5: Add Script-Specific Selectors (Optional)

Enhancement scripts usually don't need selectors in `config/selectors.json` since they create new elements rather than removing existing ones.

**However**, if your enhancement needs to:
- Find specific elements to enhance
- Insert content into specific locations
- Replace existing elements

You can add helper selectors:

```json
{
  "github": {
    "navigation": {
      "sidebar": [
        { "selector": ".Layout-sidebar", "type": "css" }
      ]
    }
  }
}
```

Then access in your script:
```typescript
const SIDEBAR_SELECTOR = window.Debloater.getSelectors('github.navigation.sidebar');
const sidebar = document.querySelector(SIDEBAR_SELECTOR[0].selector);
```

### Step 6: Build and Test

```bash
npm run build
# or for development with auto-rebuild
npm run dev
```

Load extension in browser (see removal guide) and test:

1. Navigate to target page
2. Check console for initialization logs
3. Verify enhancement appears
4. Test functionality (click, hover, etc.)
5. Toggle script in settings to disable/enable

### Common Enhancement Patterns

#### Pattern 1: Inject CSS Styles

For complex styling, inject a `<style>` element:

```typescript
function injectStyles() {
  if (document.getElementById('my-custom-styles')) return;

  const style = document.createElement('style');
  style.id = 'my-custom-styles';
  style.textContent = `
    .gh-goto-top-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      /* ... more styles ... */
    }
    
    .gh-goto-top-btn:hover {
      opacity: 0.8;
    }
  `;
  
  document.head.appendChild(style);
}
```

#### Pattern 2: Insert Into Specific Location

Find and enhance existing elements:

```typescript
function addDownloadButton() {
  // Find existing toolbar
  const toolbar = document.querySelector('.file-navigation');
  if (!toolbar) {
    console.warn('Toolbar not found');
    return;
  }

  // Check if already added
  if (toolbar.querySelector('#download-all-btn')) return;

  // Create button
  const btn = document.createElement('button');
  btn.id = 'download-all-btn';
  btn.textContent = 'Download All';
  btn.className = 'btn btn-sm';  // Use site's existing classes
  
  btn.onclick = () => {
    // Download logic here
  };

  // Insert into toolbar
  toolbar.appendChild(btn);
}
```

#### Pattern 3: Keyboard Shortcuts

Add custom keyboard shortcuts:

```typescript
function addKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+T - Go to top
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('[Shortcuts] Scroll to top');
    }
    
    // Ctrl+Shift+B - Go to bottom
    if (e.ctrlKey && e.shiftKey && e.key === 'B') {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      console.log('[Shortcuts] Scroll to bottom');
    }
  });
}
```

#### Pattern 4: Observe and Enhance (for SPAs)

For sites that load content dynamically:

```typescript
function enhanceElements() {
  const elements = document.querySelectorAll('.item:not(.enhanced)');
  
  elements.forEach(element => {
    // Add download button to each item
    const btn = document.createElement('button');
    btn.textContent = '⬇️';
    btn.className = 'download-btn';
    btn.onclick = () => downloadItem(element);
    
    element.appendChild(btn);
    element.classList.add('enhanced');  // Mark as processed
  });
}

// Observe DOM changes
const observer = new MutationObserver(() => {
  enhanceElements();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial enhancement
enhanceElements();
```

#### Pattern 5: Respect Dark Mode

Detect and respect user's theme:

```typescript
function getThemeColors() {
  // Check GitHub's dark mode
  const isDark = document.documentElement.getAttribute('data-color-mode') === 'dark';
  
  return isDark ? {
    background: '#0d1117',
    text: '#c9d1d9',
    accent: '#58a6ff'
  } : {
    background: '#ffffff',
    text: '#24292f',
    accent: '#0969da'
  };
}

function createButton() {
  const colors = getThemeColors();
  const btn = document.createElement('button');
  
  Object.assign(btn.style, {
    backgroundColor: colors.accent,
    color: colors.background,
    // ... more styles
  });
  
  return btn;
}

// Watch for theme changes
const observer = new MutationObserver(() => {
  updateButtonTheme();
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-color-mode']
});
```

### Advanced: Using Debloater Utilities

The extension provides helper utilities in `window.Debloater`:

```typescript
// Wait for element to appear
window.Debloater.waitForElement('.my-selector', (element) => {
  console.log('Element appeared!', element);
  enhanceElement(element);
});

// Get selectors from config
const selectors = window.Debloater.getSelectors('site.category.name');

// More utilities in core/dom-utils.ts
```

## Example: YouTube Download Button

**Complete example:** Add download button to YouTube videos

**1. Script** (`src/content-scripts/youtube/add/player/downloadButton.ts`):

```typescript
/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  if (!window.Debloater) return;

  function addDownloadButton() {
    // Find video player controls
    const controls = document.querySelector('.ytp-right-controls');
    if (!controls || document.getElementById('yt-download-btn')) return;

    // Create button
    const btn = document.createElement('button');
    btn.id = 'yt-download-btn';
    btn.className = 'ytp-button';
    btn.title = 'Download Video';
    btn.innerHTML = '⬇️';
    
    btn.onclick = () => {
      const videoId = new URLSearchParams(window.location.search).get('v');
      if (videoId) {
        window.open(\`https://youtube.com/watch?v=\${videoId}\`, '_blank');
        console.log('[Download] Opening download page');
      }
    };

    controls.prepend(btn);
    console.log('[Download] Button added');
  }

  // YouTube is a SPA - watch for navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.pathname === '/watch') {
        setTimeout(addDownloadButton, 1000);  // Wait for player to load
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Initial load
  if (location.pathname === '/watch') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addDownloadButton, 1000);
      });
    } else {
      setTimeout(addDownloadButton, 1000);
    }
  }
})();
```

**2. Config** (`config/scripts.ts`):

```typescript
pathScripts: [
  {
    id: 'downloadButton',
    name: 'Download Button',
    description: 'Add download button to video player',
    scriptPath: 'youtube/add/player/downloadButton.js',
    urlPattern: 'youtube\\..*/watch.*',  // Only on video pages
    type: 'enhancement',
    defaultEnabled: false,  // Disabled by default
  },
]
```

## Troubleshooting

### Enhancement not appearing
- ✅ Check timing - element may not exist yet
- ✅ Use `setTimeout()` or `MutationObserver` for late-loaded elements
- ✅ Verify URL pattern matches
- ✅ Check for duplicate IDs
- ✅ Inspect console for errors

### Styling issues
- ✅ Increase `z-index` for floating elements
- ✅ Use `!important` if site styles override yours
- ✅ Match site's existing CSS classes
- ✅ Test in both light and dark modes

### Script runs multiple times
- ✅ Check for existing element before creating
- ✅ Use unique IDs
- ✅ Add class like `.enhanced` to mark processed elements

## Best Practices

1. **Check for duplicates** - Always check if your enhancement already exists
2. **Unique IDs** - Use unique, prefixed IDs (e.g., `gh-goto-top-btn`)
3. **Responsive design** - Test on different screen sizes
4. **Performance** - Avoid heavy operations in event listeners
5. **Accessibility** - Add ARIA labels and keyboard navigation
6. **Cleanup** - Remove elements/listeners when script is disabled
7. **Site styles** - Reuse site's existing CSS classes when possible
8. **Error handling** - Wrap in try-catch and provide fallbacks

## Testing Checklist

- [ ] Enhancement appears in correct location
- [ ] No duplicate elements created
- [ ] Functionality works as expected
- [ ] Works after page navigation (SPAs)
- [ ] Respects dark/light mode
- [ ] Works on mobile/desktop viewports
- [ ] No console errors
- [ ] Can be toggled on/off in settings
- [ ] Doesn't break site functionality

---

## Next Steps

- Learn about [Adding Removal Scripts](./add-remove-content-for-page.md)
- See `src/content-scripts/github/add/goToTopButton.ts` for a complete example
- Check `core/dom-utils.ts` for available helper functions
- Read about [Mutation Observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) for dynamic content
