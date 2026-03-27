---
name: add-script
description: 'Add removal or enhancement script by editing scripts-config.json. Data-driven - no TypeScript files needed. Updates deploy via GitHub without Chrome Store review.'
argument-hint: 'What to add (e.g., "hide YouTube Shorts button" or "add GitHub scroll-to-top button")'
---

# Add Script (Data-Driven)

Add removal or enhancement scripts by updating `config/scripts-config.json`. 
Changes deploy automatically via GitHub - no Chrome Store review needed.

## Architecture

**Data-Driven System:**
- ✅ All scripts defined in `scripts-config.json`
- ✅ Generic engines execute the configs
- ✅ Remote updates every 6 hours
- ✅ No TypeScript files for simple scripts
- ✅ No rebuild required
- ✅ CSP & Trusted Types compliant

**Components:**
- `scripts-config.json` - All script definitions with inline selectors
- `removal-engine.ts` - Executes removal configs
- `enhancement-engine.ts` - Executes enhancement configs (floating buttons, shortcuts)
- `predefined-actions` - 20+ reusable functions (injected directly, no eval)

## When to Use

**Use for:**
- Simple element removal (CSS/XPath selectors)
- Floating buttons (scroll-to-top, etc.)
- Keyboard shortcuts
- Predefined actions (scroll, copy, media controls)

**Use bundled TypeScript for:**
- Complex state management
- Custom UI components (like WhatsApp privacy blur)
- Advanced logic requiring variables

## Procedure

### 1. Gather Information

Ask:
```
1. What does this script do? (e.g., "Hide Shorts button on YouTube")
```

```
2. Type?
   1. Removal (hide/delete elements)
   2. Enhancement (add functionality)
```

```
3. Which site?
   1. YouTube (youtube.com)
   2. GitHub (github.com)
   3. Instagram (instagram.com)
   4. WhatsApp (web.whatsapp.com)
```

```
4. Run on all pages or specific pages?
   1. All pages
   2. Specific URL pattern
```

If specific:
```
5. URL pattern? (regex, e.g., "youtube\\.com/watch.*")
   Use \\. for dots, .* for wildcards, ($|\\?) for optional query params
```

### 2. Get Script Details

**For Removal:**
```
6. CSS selector(s) to remove? 
   Test: document.querySelectorAll('YOUR_SELECTOR')
   Multiple selectors OK - list all
   
7. Selector type? (css/xpath/id/class)
   
8. Special requirements?
   - Observe DOM changes? (default: true)
   - Retry delay? (milliseconds to wait before retrying)
   - Wait for user input? (for elements that appear after interaction)
   - Wait for element? (CSS selector that must exist first)
```

**For Enhancement - Floating Button:**
```
6. Button text/emoji? (e.g., "↑" or "⬆ Top")
7. Position? (bottom-right/bottom-left/top-right/top-left)
8. Background color? (hex, e.g., "#0969da")
9. Text color? (hex, e.g., "white")
10. Size? (pixels, e.g., 50)
11. Show after scroll distance? (pixels, e.g., 300, or 0 for always visible)
12. Click action? (from predefined-actions: scrollToTop, scrollToBottom, etc.)
```

**For Enhancement - Keyboard Shortcut:**
```
6. Key combination? (e.g., "ctrl+shift+t", "alt+space")
7. Action? (from predefined-actions: scrollToTop, copyCurrentURL, etc.)
8. Prevent default browser behavior? (true/false)
```

### 3. Create Script Entry

Open `config/scripts-config.json` and add to the appropriate site:

**Removal Example (Multiple Selectors):**
```json
{
  "hideShortsButton": {
    "id": "hideShortsButton",
    "name": "Hide Shorts Button",
    "description": "Removes the Shorts button from YouTube sidebar and mini guide",
    "type": "removal",
    "defaultEnabled": false,
    "removal": {
      "selectors": [
        {
          "selector": "ytd-guide-entry-renderer a[title='Shorts']",
          "type": "css"
        },
        {
          "selector": "ytd-mini-guide-entry-renderer a[title='Shorts']",
          "type": "css"
        }
      ],
      "observeChanges": true
    }
  }
}
```

**Removal Example (Wait for User Input):**
```json
{
  "removePopup": {
    "id": "removePopup",
    "name": "Remove Popup After Interaction",
    "description": "Removes popup that appears after user clicks",
    "type": "removal",
    "defaultEnabled": false,
    "removal": {
      "selectors": [
        {
          "selector": "#popup-dialog",
          "type": "css"
        }
      ],
      "observeChanges": true,
      "waitForFirstUserInput": true,
      "checkAfterFirstInput": 250
    }
  }
}
```

**Enhancement - Floating Button Example:**
```json
{
  "goToTopButton": {
    "id": "goToTopButton",
    "name": "Go to Top Button",
    "description": "Adds a floating button to scroll to top",
    "type": "enhancement",
    "defaultEnabled": true,
    "enhancement": {
      "enhancementType": "floating-button",
      "floatingButton": {
        "text": "↑",
        "style": {
          "position": "bottom-right",
          "backgroundColor": "#0969da",
          "color": "white",
          "size": 50
        },
        "showOnScroll": 300,
        "onClick": "scrollToTop"
      }
    }
  }
}
```

**Enhancement - Keyboard Shortcut Example:**
```json
{
  "scrollShortcut": {
    "id": "scrollShortcut",
    "name": "Scroll to Top Shortcut",
    "description": "Press Ctrl+Shift+T to scroll to top",
    "type": "enhancement",
    "defaultEnabled": true,
    "enhancement": {
      "enhancementType": "keyboard-shortcut",
      "keyboardShortcut": {
        "keys": "ctrl+shift+t",
        "action": "scrollToTop",
        "preventDefault": true
      }
    }
  }
}
```

### 4. Test & Deploy

**Local Testing:**
```bash
npm run build
# Reload extension in chrome://extensions
# Test on the target site
```

**Deploy to Users:**
```bash
git add config/scripts-config.json
git commit -m "Add [script name] for [site]"
git push origin main
```

Users get updates automatically within 6 hours (or click "Check for Updates" in extension).

## Available Predefined Actions

All actions are CSP-compliant (no eval):

**Navigation:**
- `scrollToTop` - Smooth scroll to page top
- `scrollToBottom` - Smooth scroll to page bottom
- `scrollToElement` - Scroll to element by selector
- `goBack` - Browser back
- `goForward` - Browser forward
- `reload` - Reload page

**Clipboard:**
- `copyToClipboard` - Copy text to clipboard
- `copyCurrentURL` - Copy current page URL
- `copyPageTitle` - Copy page title

**Media Controls:**
- `playPause` - Toggle video play/pause
- `rewindVideo` - Rewind 10 seconds (or custom)
- `forwardVideo` - Forward 10 seconds (or custom)
- `toggleFullscreen` - Toggle fullscreen mode
- `toggleMute` - Toggle video/audio mute

**UI Actions:**
- `toggleElement` - Show/hide element by selector
- `focusElement` - Focus element by selector
- `clickElement` - Click element by selector

**Utilities:**
- `printPage` - Print current page
- `openInNewTab` - Open URL in new tab
- `downloadCurrentPage` - Download page as HTML

## Configuration Options

**Removal Scripts:**
```typescript
{
  selectors: Array<{
    selector: string;        // CSS, XPath, ID, or class
    type?: "css"|"xpath"|"id"|"class";  // Default: "css"
  }>;
  observeChanges?: boolean;      // Watch for new elements (default: true)
  waitFor?: string;              // Wait for selector before running
  retryDelay?: number;           // Wait N ms then retry (for delayed content)
  waitForFirstUserInput?: boolean;  // Wait for click/scroll/keypress
  checkAfterFirstInput?: number; // Delay after first input (default: 250ms)
  urlPattern?: string;           // Regex - only run on matching URLs
}
```

**Enhancement Scripts:**
```typescript
{
  enhancementType: "floating-button" | "keyboard-shortcut";
  
  floatingButton?: {
    text: string;              // Text or emoji
    icon?: string;             // Alternative to text
    style?: {
      position?: "bottom-right"|"bottom-left"|"top-right"|"top-left";
      backgroundColor?: string;  // Hex color
      color?: string;           // Text color
      size?: number;            // Pixels
    };
    showOnScroll?: number;     // Show after N pixels scrolled
    onClick: string;           // Predefined action name
    onClickParams?: any[];     // Parameters for action
  };
  
  keyboardShortcut?: {
    keys: string;              // "ctrl+shift+t", "alt+space"
    action: string;            // Predefined action name
    actionParams?: any[];      // Parameters for action
    preventDefault?: boolean;  // Block browser default
  };
}
```

## Tips

**Finding Selectors:**
```javascript
// Browser console
document.querySelectorAll('YOUR_SELECTOR')
// Should highlight the target elements

// For XPath
$x("//div[@class='example']")
```

**Testing Regex Patterns:**
```javascript
// Browser console
const pattern = /youtube\.com\/watch.*/;
pattern.test(window.location.href);  // Should return true on match
```

**Common Patterns:**
- Home only: `instagram\\.com/?($|\\?)`
- Video pages: `youtube\\.com/watch.*`
- User profiles: `github\\.com/[^/]+/?$`
- Subscriptions: `youtube\\.com/feed/subscriptions`

## Troubleshooting

**Selectors not working?**
- Test in browser console first
- Check if elements load dynamically (use `retryDelay` or `observeChanges`)
- Try XPath if CSS selector fails
- Use browser DevTools to inspect element

**Button not appearing?**
- Check console for errors
- Verify predefined action exists
- Check CSP errors (should be none with current implementation)
- Ensure DOM is loaded (engine waits automatically)

**URL pattern not matching?**
- Escape dots: `\\.`
- Use `($|\\?)` for optional query params
- Test pattern in console: `new RegExp("YOUR_PATTERN").test(window.location.href)`
  "hideShortsButton": {
    "id": "hideShortsButton",
    "name": "Hide Shorts Button",
    "description": "Removes the Shorts button from YouTube sidebar",
    "type": "removal",
    "defaultEnabled": true,
    "removal": {
      "selectorPath": "ytd-mini-guide-entry-renderer:has(a[href*=\"/shorts\"])",
      "observeChanges": true
    }
  }
}
```

**Enhancement - Floating Button Example:**
```json
{
  "goToTopButton": {
    "id": "goToTopButton",
    "name": "Go to Top Button",
    "description": "Adds a floating button to scroll to top",
    "type": "enhancement",
    "defaultEnabled": true,
    "enhancement": {
      "enhancementType": "floating-button",
      "floatingButton": {
        "text": "↑ Top",
        "style": {
          "position": "bottom-right",
          "backgroundColor": "#4CAF50",
          "color": "white"
        },
        "showOnScroll": 300,
        "onClick": "scrollToTop"
      }
    }
  }
}
```

**Enhancement - Keyboard Shortcut Example:**
```json
{
  "scrollShortcut": {
    "id": "scrollShortcut",
    "name": "Scroll Shortcuts",
    "description": "Ctrl+T scrolls to top",
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

### 4. Test & Deploy

**Local Testing:**
```bash
npm run build
# Load extension in Chrome
```

**Deploy to Users:**
```bash
git add config/scripts-config.json
git commit -m "Add [script name]"
git push
```

Users get updates automatically within 6 hours (or click "Check for Updates").

## Available Predefined Actions

See `src/engines/predefined-actions.ts`:
- `scrollToTop` - Scroll to page top
- `scrollToBottom` - Scroll to page bottom
- `copyToClipboard` - Copy text
- `openInNewTab` - Open URL in new tab
- `toggleDarkMode` - Toggle dark mode
- `printPage` - Print page
- And 15+ more...

## Tips

**Finding Selectors:**
```javascript
// Browser console
document.querySelectorAll('YOUR_SELECTOR')
// Should highlight the elements you want to remove
```

**Testing Before Deploying:**
- Build locally first
- Test in browser
- Then push to GitHub

**URL Patterns:**
- Use `\.` for dots: `youtube\.com`
- Use `.*` for wildcards: `youtube\.com/watch.*`
- Use `\/` for slashes: `youtube\.com\/shorts`

## Next Steps

After adding script:
1. Test locally with `npm run build`
2. Push to GitHub
3. Users get update automatically
4. Monitor for issues

No Chrome Store submission needed! 🎉
