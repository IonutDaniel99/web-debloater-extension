---
name: add-enhancement-script
description: 'Add enhancement scripts (floating buttons, keyboard shortcuts) by editing scripts-config.json. Data-driven - uses predefined actions. No code needed.'
argument-hint: 'What enhancement to add (e.g., "scroll to top button on GitHub")'
---

# Add Enhancement Script (Data-Driven)

Add floating buttons or keyboard shortcuts by editing `config/scripts-config.json`. Uses predefined actions - no JavaScript needed.

## When to Use

✅ **Use for:**
- Floating buttons (scroll to top, download, etc.)
- Keyboard shortcuts (ctrl+T for scroll, etc.)
- Actions using predefined functions
- Simple UI enhancements

❌ **Do NOT use for:**
- Complex custom UI components
- Features requiring state/variables
- Custom JavaScript logic

## Available Predefined Actions

All CSP-compliant (no eval):

**Navigation:**
- `scrollToTop` - Smooth scroll to top
- `scrollToBottom` - Scroll to bottom
- `scrollToElement` - Scroll to selector
- `goBack` - Browser back
- `goForward` - Browser forward
- `reload` - Reload page

**Clipboard:**
- `copyToClipboard` - Copy text
- `copyCurrentURL` - Copy page URL
- `copyPageTitle` - Copy page title

**Media:**
- `playPause` - Toggle video play/pause
- `rewindVideo` - Rewind 10s (customizable)
- `forwardVideo` - Forward 10s (customizable)
- `toggleFullscreen` - Toggle fullscreen
- `toggleMute` - Toggle mute

**UI:**
- `toggleElement` - Show/hide element
- `focusElement` - Focus element
- `clickElement` - Click element

**Utilities:**
- `printPage` - Print page
- `openInNewTab` - Open URL in new tab
- `downloadCurrentPage` - Download as HTML

## Procedure

### Step 1: Basic Info

**Q1: Site?**
```
Which site?
1. YouTube
2. GitHub
3. Instagram  
4. WhatsApp
```

**Q2: Enhancement type?**
```
What type of enhancement?
1. Floating button
2. Keyboard shortcut
```

**Q3: Script details**
```
Script ID (camelCase)? Examples: goToTopButton, scrollShortcut
Name? (e.g., "Go to Top Button")
Description? (e.g., "Adds floating button to scroll to top")
```

### Step 2A: Floating Button Config

If type = Floating Button:

```
1. Button text/emoji? (e.g., "↑", "⬆ Top", "↓")

2. Position?
   1. Bottom right
   2. Bottom left
   3. Top right
   4. Top left

3. Background color? (hex, e.g., "#0969da")

4. Text color? (hex, e.g., "white")

5. Size? (pixels, e.g., 50)

6. Show after scroll distance? (pixels, 0 for always visible)
   Examples: 0 (always), 300 (after 300px scroll)

7. Click action? (from predefined actions above)

8. Action parameters? (optional, e.g., seconds for rewindVideo)
```

### Step 2B: Keyboard Shortcut Config

If type = Keyboard Shortcut:

```
1. Key combination? 
   Examples: "ctrl+t", "ctrl+shift+s", "alt+space"
   
2. Action? (from predefined actions above)

3. Action parameters? (optional)

4. Prevent default browser behavior? (y/n)
   Example: Yes for ctrl+t to prevent opening new tab
```

### Step 3: Add to JSON

Edit `config/scripts-config.json`:

**Floating Button Example:**
```json
{
  "sites": {
    "github": {
      "scripts": {
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
    }
  }
}
```

**Keyboard Shortcut Example:**
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

**With Action Parameters:**
```json
{
  "rewindButton": {
    "id": "rewindButton",
    "name": "Rewind 30s Button",
    "description": "Rewind video by 30 seconds",
    "type": "enhancement",
    "defaultEnabled": true,
    "enhancement": {
      "enhancementType": "floating-button",
      "floatingButton": {
        "text": "⏪30s",
        "style": {
          "position": "bottom-left",
          "backgroundColor": "#ff0000",
          "color": "white",
          "size": 60
        },
        "showOnScroll": 0,
        "onClick": "rewindVideo",
        "onClickParams": [30]
      }
    }
  }
}
```

**Page-Specific (URL Pattern):**
```json
{
  "videoControls": {
    "id": "videoControls",
    "name": "Video Shortcuts",
    "description": "Keyboard shortcuts for YouTube videos",
    "type": "enhancement",
    "defaultEnabled": true,
    "urlPattern": "youtube\\.com/watch.*",
    "enhancement": {
      "enhancementType": "keyboard-shortcut",
      "keyboardShortcut": {
        "keys": "space",
        "action": "playPause",
        "preventDefault": true
      }
    }
  }
}
```

### Step 4: Test & Deploy

**Local Test:**
```bash
npm run build
# Reload extension in chrome://extensions
# Navigate to target site
# Check button appears or shortcut works
# Console: [site][scriptId] messages
```

**Deploy:**
```bash
git add config/scripts-config.json
git commit -m "Add [feature] enhancement for [site]"
git push origin main
```

## Configuration Reference

```typescript
{
  "id": string,
  "name": string,
  "description": string,
  "type": "enhancement",
  "defaultEnabled": boolean,
  "urlPattern"?: string,
  "enhancement": {
    "enhancementType": "floating-button" | "keyboard-shortcut",
    
    // If floating-button:
    "floatingButton"?: {
      "text": string,              // Text or emoji
      "icon"?: string,             // Alternative to text
      "style"?: {
        "position"?: "bottom-right"|"bottom-left"|"top-right"|"top-left",
        "backgroundColor"?: string,  // Hex color
        "color"?: string,           // Text color
        "size"?: number             // Pixels
      },
      "showOnScroll"?: number,     // Pixels (0 = always visible)
      "onClick": string,           // Predefined action name
      "onClickParams"?: any[]      // Parameters for action
    },
    
    // If keyboard-shortcut:
    "keyboardShortcut"?: {
      "keys": string,              // "ctrl+t", "alt+space"
      "action": string,            // Predefined action name
      "actionParams"?: any[],      // Parameters for action
      "preventDefault"?: boolean   // Block browser default
    }
  }
}
```

## Button Styling Tips

**Colors:**
- GitHub blue: `#0969da`
- YouTube red: `#ff0000`
- Success green: `#4CAF50`
- Warning orange: `#FF9800`
- Neutral gray: `#757575`

**Positions:**
- `bottom-right` - Most common for scroll buttons
- `bottom-left` - For secondary actions
- `top-right` - For always-visible actions
- `top-left` - Rare, use sparingly

**Sizes:**
- Small: `40px`
- Medium: `50px`
- Large: `60px`

**Scroll Threshold:**
- `0` - Always visible (use sparingly)
- `300` - Standard (appears after small scroll)
- `500` - Delayed (appears after more scrolling)

## Common Use Cases

**Scroll to Top:**
```json
{
  "text": "↑",
  "position": "bottom-right",
  "backgroundColor": "#0969da",
  "showOnScroll": 300,
  "onClick": "scrollToTop"
}
```

**Scroll to Bottom:**
```json
{
  "text": "↓",
  "position": "bottom-left",
  "backgroundColor": "#FF9800",
  "showOnScroll": 300,
  "onClick": "scrollToBottom"
}
```

**Copy URL:**
```json
{
  "text": "🔗",
  "position": "top-right",
  "backgroundColor": "#4CAF50",
  "showOnScroll": 0,
  "onClick": "copyCurrentURL"
}
```

**Print Page:**
```json
{
  "keys": "ctrl+p",
  "action": "printPage",
  "preventDefault": true
}
```

## Troubleshooting

**Button not appearing?**
- Check console for errors
- Verify predefined action exists
- Check if CSP blocking (shouldn't with current implementation)
- Scroll past threshold if `showOnScroll` > 0

**Shortcut not working?**
- Check for key conflicts with browser/site
- Verify `preventDefault` setting
- Test in console: `document.addEventListener('keydown', e => console.log(e.key))`
- Check modifiers match (ctrl, shift, alt)

**Action not executing?**
- Check action name spelling
- Verify parameters format (array)
- Check console for predefined action errors
- Ensure action is appropriate (e.g., video actions need video element)

## Notes

- All enhancements are CSP-compliant (no eval)
- Trusted Types compliant (uses textContent, not innerHTML)
- Works on sites with strict security policies (GitHub, Google)
- Buttons auto-hide/show based on scroll
- Shortcuts use passive listeners for performance
