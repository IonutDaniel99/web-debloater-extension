---
name: add-removal-script
description: 'Add a new content removal script to an existing site by updating scripts-config.json. Data-driven approach - no TypeScript files needed. Scripts update remotely without Chrome Store review.'
argument-hint: 'Brief description of what to remove (e.g., "hide Shorts button on YouTube")'
---

# Add Removal Script (Data-Driven)

Add content removal scripts by editing `config/scripts-config.json` only. No TypeScript files needed.

## When to Use

✅ **Use for:**
- Removing UI elements from YouTube, GitHub, Instagram, WhatsApp
- Hiding content with CSS/XPath selectors
- Scripts that wait for user interaction
- Scripts that need multiple selectors

❌ **Do NOT use for:**
- Complex logic requiring variables/state
- Custom UI components (use bundled scripts)
- Adding new sites (requires manual JSON structure)

## Architecture

**How it works:**
1. Define script in `scripts-config.json` with inline selectors
2. Commit & push to GitHub
3. Users get update automatically (6 hours or manual click)
4. Generic `removal-engine.ts` executes the configuration
5. No Chrome Store review needed!

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

**Q2: Feature name?**
```
What to remove? (e.g., "Shorts button", "Sponsored posts")
```

**Q3: Script ID?**
```
Script ID (camelCase)?
Examples: hideShortsButton, removeSponsored, hideReelsShelf
```

**Q4: URL Pattern?**
```
Run on:
1. All pages
2. Specific pages only

If 2, provide regex pattern:
Examples:
- youtube\\.com/watch.*              (video pages)  
- instagram\\.com/?($|\\?)           (home with optional ?theme=dark)
- github\\.com/[^/]+/[^/]+/issues   (issues pages)
```

### Step 2: Selectors

**Q5: Find selectors**
```
Open browser DevTools (F12) and test:
document.querySelectorAll('YOUR_SELECTOR')

How many selectors?
1. Single selector
2. Multiple selectors (for different variations)
```

**For each selector:**
```
1. Selector value? (e.g., "ytd-guide-entry-renderer a[title='Shorts']")
2. Selector type?
   1. CSS (default)
   2. XPath
   3. ID
   4. Class
```

### Step 3: Advanced Options

**Q6: Behavior?**
```
Special behavior needed?

1. Observe changes? (watch for new elements)
   Default: Yes
   
2. Retry delay? (wait N ms then try again)
   Default: None
   Example: 1000 (for delayed content)
   
3. Wait for user input? (click/scroll/keypress triggers script)
   Default: No
   Use for: Popups that appear after interaction
   Delay after input: 250ms (adjustable)
   
4. Wait for element? (CSS selector that must exist first)
   Default: None
   Example: #main (for WhatsApp)
```

### Step 4: Add to JSON

Edit `config/scripts-config.json`:

**Basic Removal (Single Selector):**
```json
{
  "sites": {
    "youtube": {
      "scripts": {
        "hideShortsButton": {
          "id": "hideShortsButton",
          "name": "Hide Shorts Button",
          "description": "Removes the Shorts button from YouTube navigation",
          "type": "removal",
          "defaultEnabled": false,
          "removal": {
            "selectors": [
              {
                "selector": "ytd-guide-entry-renderer a[title='Shorts']",
                "type": "css"
              }
            ],
            "observeChanges": true
          }
        }
      }
    }
  }
}
```

**Multiple Selectors:**
```json
{
  "hideShortsButton": {
    "id": "hideShortsButton",
    "name": "Hide Shorts Button",
    "description": "Removes Shorts from sidebar and mini guide",
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

**Page-Specific (URL Pattern):**
```json
{
  "hideShortsHome": {
    "id": "hideShortsHome",
    "name": "Hide Shorts on Home",
    "description": "Removes Shorts shelf from YouTube home page",
    "type": "removal",
    "defaultEnabled": false,
    "urlPattern": "youtube\\.com/?$",
    "removal": {
      "selectors": [
        {
          "selector": "ytd-rich-shelf-renderer[is-shorts]",
          "type": "css"
        }
      ],
      "observeChanges": true,
      "retryDelay": 1000
    }
  }
}
```

**Wait for User Input:**
```json
{
  "removePopup": {
    "id": "removePopup",
    "name": "Remove Popup After Click",
    "description": "Removes WhatsApp promotional popup",
    "type": "removal",
    "defaultEnabled": false,
    "removal": {
      "selectors": [
        {
          "selector": "#side > div:nth-child(6)",
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

**XPath Selector:**
```json
{
  "removeDialog": {
    "id": "removeDialog",
    "name": "Remove Dialog",
    "description": "Removes dialog using XPath",
    "type": "removal",
    "defaultEnabled": false,
    "removal": {
      "selectors": [
        {
          "selector": "//div[contains(text(), 'Get WhatsApp')]//ancestor::div[@role='dialog']",
          "type": "xpath"
        }
      ],
      "observeChanges": true
    }
  }
}
```

### Step 5: Test & Deploy

**Local Test:**
```bash
npm run build
# Reload extension in chrome://extensions
# Enable script in extension settings
# Navigate to target page
# Check console: [site][scriptId] messages
```

**Deploy:**
```bash
git add config/scripts-config.json
git commit -m "Add [feature] removal for [site]"
git push origin main
```

**Users get updates:**
- Automatically within 6 hours
- Or click "Check for Updates" in extension

## Configuration Reference

```typescript
{
  "id": string,              // Unique ID (camelCase)
  "name": string,            // Display name
  "description": string,     // What it does
  "type": "removal",         // Always "removal"
  "defaultEnabled": boolean, // false recommended
  "urlPattern"?: string,     // Optional: regex for specific pages
  "removal": {
    "selectors": Array<{
      "selector": string,    // CSS, XPath, ID, or class
      "type"?: "css"|"xpath"|"id"|"class"  // Default: "css"
    }>,
    "observeChanges"?: boolean,        // Watch for new elements (default: true)
    "retryDelay"?: number,             // Wait N ms then retry
    "waitForFirstUserInput"?: boolean, // Wait for click/scroll/keypress
    "checkAfterFirstInput"?: number,   // Delay after input (default: 250ms)
    "waitFor"?: string                 // CSS selector that must exist first
  }
}
```

## Selector Testing

**CSS:**
```javascript
document.querySelectorAll('ytd-guide-entry-renderer a[title="Shorts"]')
```

**XPath:**
```javascript
$x("//div[contains(text(), 'Shorts')]")
```

**ID:**
```javascript
document.getElementById('shorts-button')
```

**Class:**
```javascript
document.querySelectorAll('.x1dr59a3.x13vifvy')
```

## Common Patterns

**Home page only:**
```
"urlPattern": "instagram\\.com/?($|\\?)"
```

**Video pages:**
```
"urlPattern": "youtube\\.com/watch.*"
```

**User profiles:**
```
"urlPattern": "github\\.com/[^/]+/?$"
```

**Feed pages:**
```
"urlPattern": "youtube\\.com/feed/(subscriptions|trending)"
```

## Tips

1. **Test selectors first** - Always verify in DevTools before adding
2. **Multiple selectors** - Use array for variations (mobile/desktop)
3. **Observe changes** - Keep true for SPAs (YouTube, Instagram)
4. **URL patterns** - Escape dots `\\.` and use `.*` for wildcards
5. **User input** - Use for popups that appear after clicks
6. **Retry delay** - Use for elements that load slowly

## Troubleshooting

**Selector not working?**
- Test in browser console first
- Check if element loads dynamically (use retryDelay)
- Try XPath if CSS fails
- Inspect element structure in DevTools

**URL pattern not matching?**
- Test: `new RegExp("pattern").test(window.location.href)`
- Escape dots: `\\.`
- Use `($|\\?)` for optional query params

**Script not activating?**
- Check console for initialization message
- Verify script is enabled in settings
- Check URL pattern matches current page
- Ensure selectors are defined correctly
