# Web Debloater & Enhancer Extension - Documentation

Welcome to the Web Debloater & Enhancer Extension documentation!

## 🏗️ Architecture (Data-Driven)

This extension uses a **data-driven architecture**:
- ✅ Scripts defined in `config/scripts-config.json`
- ✅ Generic engines execute configs
- ✅ Remote updates via GitHub (no Chrome Store review)
- ✅ Auto-updates every 6 hours
- ✅ No TypeScript files for simple scripts

## 📚 Documentation

- **[Data-Driven Architecture](./data-driven-architecture.md)** - How the system works
- **Central Config**: `config.ts` - All settings in one place
- **Remote Config**: GitHub repo auto-updates to users

## 🚀 Quick Start

### Add a Removal Script

1. Open `config/scripts-config.json`
2. Add to the appropriate site:

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

3. Push to GitHub - users get update automatically!

### Add an Enhancement Script

1. Open `config/scripts-config.json`
2. Add to the appropriate site:

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
        "onClick": "scrollToTop"
      }
    }
  }
}
```

3. Push to GitHub!

## 📁 Project Structure

```
web-debloater-extension/
├── config.ts                    # Central configuration
├── config/
│   └── scripts-config.json      # All script definitions
├── src/
│   ├── engines/                 # Generic engines
│   │   ├── removal-engine.ts   # Executes removals
│   │   ├── enhancement-engine.ts # Executes enhancements
│   │   └── predefined-actions.ts # 20+ actions
│   ├── core/
│   │   ├── remote-config.ts    # Fetch/cache configs
│   │   └── script-injector.ts  # Hybrid injection
│   ├── page-scripts/           # Bundled scripts (complex only)
│   │   └── whatsapp/add/privacyBlurControls.ts
│   └── webpage/                # Settings UI
│       └── pages/DynamicSitePage.tsx # Dynamic site pages
└── docs/                       # You are here!
```

## 🛠️ Development Workflow

```bash
# Install
npm install

# Build
npm run build

# Load in Chrome
# chrome://extensions/ → Load unpacked → dist/

# Deploy changes
git add config/scripts-config.json
git push
# Users get update within 6 hours!
```

## 💡 Available Predefined Actions

See `src/engines/predefined-actions.ts`:
- `scrollToTop` / `scrollToBottom`
- `copyToClipboard`
- `openInNewTab`
- `toggleDarkMode`
- `printPage`
- And 15+ more...

## 🎯 When to Use What

**Data-Driven (JSON):**
- Simple element removal
- Floating buttons
- Keyboard shortcuts
- Predefined actions

**Bundled TypeScript:**
- Complex state management
- Custom UI components
- Advanced logic
- See: `whatsapp/add/privacyBlurControls.ts`

## 🔧 Configuration

Edit `config.ts` to change:
- GitHub repository URL
- Auto-update interval (default 6h)
- Storage keys
- Feature flags

## 📖 Further Reading

- [Data-Driven Architecture](./data-driven-architecture.md)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/)
- Open an issue if you find problems

---

Happy coding! 🎉
