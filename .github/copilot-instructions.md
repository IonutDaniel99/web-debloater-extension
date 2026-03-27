# Web Debloater & Enhancer Extension - Agent Instructions

Chrome extension for removing clutter and adding enhancements to websites using a **data-driven architecture** with auto-updating remote configurations.

## 🎯 Core Architecture Principle

**Static bundled code + dynamic remote configuration** (Chrome Web Store compliant)

- ✅ Download JSON config from GitHub - YES
- ✅ Update selectors, settings, metadata dynamically - YES  
- 🚫 Execute remotely hosted JavaScript - NO (Chrome policy violation)

**Consequence:** All execution logic (engines, actions) must be bundled. Only *configuration data* updates remotely.

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Development with file watching
npm run dev

# Type check only
npm run type-check

# Production build (runs TypeScript + Vite)
npm run build

# Update version timestamp before build
npm run prebuild
```

**Build output:** `dist/` folder (load in `chrome://extensions/` with "Developer mode" enabled)

## 📐 Architecture Overview

### Request Flow

1. **Service Worker** ([src/core/service-worker.ts](src/core/service-worker.ts))
   - Manages extension lifecycle
   - Runs update checks every 6 hours via Chrome alarms
   - Fetches remote config from GitHub

2. **Remote Config Loader** ([src/core/remote-config.ts](src/core/remote-config.ts))
   - Downloads `scripts-config.json` from `REMOTE_CONFIG_URL` (see [config.ts](config.ts))
   - Stores in `chrome.storage.local` (no rebuild required)
   - Version tracking prevents redundant downloads

3. **Script Injector** ([src/core/script-injector.ts](src/core/script-injector.ts))
   - Routes scripts to appropriate execution engine based on `type` field
   - Injects DOM utils library first (`window.Debloater`)

4. **Execution Engines**
   - **Removal Engine** ([src/engines/removal-engine.ts](src/engines/removal-engine.ts)) - Parses config to hide/remove DOM elements
   - **Enhancement Engine** ([src/engines/enhancement-engine.ts](src/engines/enhancement-engine.ts)) - Adds buttons, keyboard shortcuts via predefined actions

5. **Predefined Actions** ([src/engines/predefined-actions.ts](src/engines/predefined-actions.ts))
   - 20+ bundled action functions: `scrollToTop`, `copyToClipboard`, `toggleElement`, etc.
   - Referenced by name in configs (no eval, CSP-compliant)

### Storage Schema

Managed by [src/core/storage-manager.ts](src/core/storage-manager.ts):

```typescript
{
  zone_versions: { [site]: { [zone]: version } },    // Config version tracking
  zone_settings: { [site]: { [zone]: { scriptId: boolean } } }, // User toggles
  zone_scripts: { [site]: { [zone]: scriptContent } },          // Script binaries
  last_update_check: timestamp
}
```

### UI Framework

- **Stack:** React 18 + Tailwind CSS 3 + Radix UI + Sonner toasts
- **Entry:** [src/webpage/App.tsx](src/webpage/App.tsx)
- **State:** [src/webpage/hooks/useSettings.ts](src/webpage/hooks/useSettings.ts) - Chrome storage sync
- **Dynamic UI:** [src/webpage/components/layout/dynamic-site/DynamicSitePage.tsx](src/webpage/components/layout/dynamic-site/DynamicSitePage.tsx) - Auto-generates toggle switches from remote config

## 📝 Adding Features (Data-Driven Approach)

**Prefer this for:** Simple element removal, floating buttons, keyboard shortcuts, predefined actions

### Use Existing Skills

**Do NOT manually edit files.** Instead, invoke these skills:

- `/add-script` - Add removal or enhancement script
- `/add-removal-script` - Specifically for hiding/removing elements  
- `/add-enhancement-script` - Specifically for buttons/shortcuts
- `/add-new-site` - Add support for an entirely new website

These skills guide you through interactive prompts and handle all file updates.

### Manual Process (if needed)

1. Edit [config/scripts-config.json](config/scripts-config.json)
2. Add script definition under appropriate site with this structure:

```json
{
  "scriptId": {
    "id": "scriptId",
    "name": "Human-readable name",
    "description": "What it does",
    "type": "removal" | "enhancement",
    "defaultEnabled": true,
    "removal": {
      "selectorPath": "CSS or XPath selector",
      "observeChanges": true  // Use MutationObserver
    },
    "enhancement": {
      "enhancementType": "floating-button" | "keyboard-shortcut",
      "floatingButton": { /* config */ },
      "keyboardShortcut": { /* config */ }
    }
  }
}
```

3. Commit and push to GitHub - users auto-update within 6 hours

**See:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md) and [docs/data-driven-architecture.md](docs/data-driven-architecture.md) for detailed examples.

## 🔧 Adding Complex Features (Bundled Scripts)

**Use this for:** Custom state management, complex UI components, advanced logic

1. Create TypeScript file in [src/page-scripts/](src/page-scripts/)
   - Organize by site: `src/page-scripts/youtube/add/myFeature.ts`
2. Compile happens automatically during build (esbuild → IIFE format)
3. Reference in `scripts-config.json` with `bundled: true`
4. **Important:** Script updates require Chrome Store review (unlike config-only changes)

**Examples:**
- [src/page-scripts/whatsapp/add/privacyBlurControls.ts](src/page-scripts/whatsapp/add/privacyBlurControls.ts) - Custom UI with state
- [src/page-scripts/shared/goToTopButton.ts](src/page-scripts/shared/goToTopButton.ts) - Reusable component

## ⚠️ Key Conventions & Gotchas

### Two Script Injection Modes

| Mode | When | Config | Review Required |
|------|------|--------|-----------------|
| **Data-driven** (preferred) | Simple selectors, predefined actions | `type: 'removal'` or `'enhancement'` | No (config-only) |
| **Bundled** (legacy) | Complex custom logic | `bundled: true` | Yes (code change) |

### Build System Details

- **Vite** bundles React UI and service worker
- **esbuild** compiles page scripts to IIFE format (inline in `vite.config.ts`)
- DOM utils ([src/core/dom-utils.ts](src/core/dom-utils.ts)) injected first on every page as `window.Debloater`
- Trusted Types bypass ([src/page-scripts/trusted-types-bypass.js](src/page-scripts/trusted-types-bypass.js)) copied as-is (no compilation)

### Important Files

| File | Purpose |
|------|---------|
| [config.ts](config.ts) | `REMOTE_CONFIG_URL`, update interval, storage keys |
| [config/scripts-config.json](config/scripts-config.json) | **Source of truth** - all script definitions |
| [vite.config.ts](vite.config.ts) | Build pipeline, script compilation, file copying |
| [scripts/update-version.js](scripts/update-version.js) | Bumps timestamp in manifest before build |

### Storage Best Practices

- Data-driven settings use flat keys: `scriptId` (not nested paths)
- Always use `storage-manager.ts` helpers for type safety
- Remote config updates don't require page reload (new tabs get latest)
- Old tabs keep old config until refreshed

### Selector Gotchas

- Test selectors in browser console first: `document.querySelectorAll('selector')`
- Use `observeChanges: true` for dynamically loaded content
- XPath supported via `selectorPath` (auto-detected by `//` prefix)
- URL patterns use regex: escape dots as `\\.`, use `.*` for wildcards

## 📚 Documentation Links

- **[README.md](README.md)** - Installation, features, configuration
- **[docs/data-driven-architecture.md](docs/data-driven-architecture.md)** - Architecture rationale, Chrome constraints
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common task examples
- **[MIGRATION.md](MIGRATION.md)** - Breaking changes, upgrade guides

## 🎨 UI Development

- **Tailwind CSS** for styling (config: [tailwind.config.js](tailwind.config.js))
- **Radix UI** for accessible components (checkboxes, tabs, etc.)
- **Theme:** Dark/light mode via [src/webpage/components/ThemeProvider.tsx](src/webpage/components/ThemeProvider.tsx)
- **Skill:** Use `/distinctive-ui` skill for production-quality UI components

## 🧪 Testing Workflow

1. Make changes to `scripts-config.json` or TypeScript files
2. Run `npm run build`
3. Reload extension in `chrome://extensions/`
4. Test on target website
5. Check Chrome DevTools console for errors
6. For remote config testing, temporarily edit `REMOTE_CONFIG_URL` in [config.ts](config.ts)

## 🚫 Common Mistakes to Avoid

- ❌ Don't try to execute remote JavaScript (Chrome policy violation)
- ❌ Don't duplicate config definitions across `scripts-config.json` and UI files
- ❌ Don't create bundled scripts for simple selector-based features
- ❌ Don't forget to increment version in manifest when updating bundled code
- ❌ Don't use backticks in predefined action names (use plain strings)
- ❌ Don't modify `dist/` manually (it's auto-generated on build)

## 📦 Release Process

1. Update version: `npm run version:update` (updates manifest timestamp)
2. Build: `npm run build`
3. Test extension locally
4. Commit changes: `git add . && git commit -m "Release vX.Y.Z"`
5. Push to GitHub: `git push`
6. For Chrome Web Store: zip `dist/` folder and upload

**Config-only changes:** Skip Chrome Store - just push to GitHub, users auto-update!

---

**Summary:** This extension prioritizes data-driven configuration over code changes. Use skills (`/add-script`, `/add-new-site`) for guided workflows. Consult [docs/](docs/) for architecture deep-dives.
