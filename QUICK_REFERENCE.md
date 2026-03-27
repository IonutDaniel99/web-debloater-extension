# Quick Reference

Quick guide for common tasks in the Web Debloater & Enhancer extension.

## 🚀 Quick Start

```bash
npm install
npm run build
# Load dist/ in chrome://extensions/
```

## 📝 Add Removal Script

1. Edit `config/scripts-config.json`
2. Add to appropriate site:

```json
{
  "scriptId": {
    "id": "scriptId",
    "name": "Script Name",
    "description": "What it does",
    "type": "removal",
    "defaultEnabled": true,
    "removal": {
      "selectorPath": "CSS_SELECTOR_HERE",
      "observeChanges": true
    }
  }
}
```

3. Test selector in browser console:
```javascript
document.querySelectorAll('CSS_SELECTOR_HERE')
```

4. Push to GitHub:
```bash
git add config/scripts-config.json
git commit -m "Add removal script"
git push
```

Users get update automatically!

## ✨ Add Enhancement - Button

```json
{
  "buttonId": {
    "id": "buttonId",
    "name": "Button Name",
    "description": "What it does",
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

## ⌨️ Add Enhancement - Keyboard Shortcut

```json
{
  "shortcutId": {
    "id": "shortcutId",
    "name": "Shortcut Name",
    "description": "Keyboard shortcut",
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

## 🎯 Predefined Actions

Available in `onClick` or `action` fields:

- `scrollToTop` - Scroll to top
- `scrollToBottom` - Scroll to bottom
- `copyToClipboard` - Copy to clipboard
- `openInNewTab` - Open URL in new tab
- `toggleDarkMode` - Toggle dark mode
- `printPage` - Print page
- `downloadPageAsImage` - Save page as image
- `focusSearchBox` - Focus search input
- 15+ more in `src/engines/predefined-actions.ts`

## ⚙️ Configuration

Edit `config.ts`:

```typescript
// GitHub URL
export const REMOTE_CONFIG_URL = 
  'https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/config/scripts-config.json';

// Update interval (hours)
export const AUTO_UPDATE_INTERVAL_HOURS = 6;
```

## 🏗️ Project Structure

```
config.ts                       # Central config
config/scripts-config.json      # All scripts
src/engines/                    # Generic engines
src/page-scripts/              # Complex bundled scripts only
src/webpage/pages/DynamicSitePage.tsx  # Dynamic UI
```

## 🧪 Testing

**Test selector:**
```javascript
document.querySelectorAll('YOUR_SELECTOR')
```

**Local build:**
```bash
npm run build
# Reload extension in Chrome
```

**Deploy:**
```bash
git push
# Users get update within 6 hours
```

## 📦 File Sizes

- Extension: ~0.37MB
- Config JSON: ~2-3KB
- Updates deploy via JSON only (no rebuild needed)

## 💡 Tips

- ✅ Use data-driven (JSON) for simple scripts
- ✅ Use bundled TypeScript for complex logic
- ✅ Test selectors in browser console first
- ✅ Push to GitHub to deploy to users
- ✅ Changes take <6 hours to reach users
- ❌ No Chrome Store review for config changes!
