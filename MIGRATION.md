# Migration Guide - March 2026 Update

This guide helps you migrate from older versions to the latest codebase structure.

## Directory Restructure: `content-scripts/` → `page-scripts/`

### What Changed

The directory `src/content-scripts/` has been renamed to `src/page-scripts/` for better semantic clarity.

### Why This Change

- **Clearer Purpose**: "page-scripts" better describes scripts injected into webpage context
- **Avoid Confusion**: Distinguishes from Chrome's Content Scripts API terminology
- **Better Organization**: More intuitive for developers adding new features

### Migration Steps

If you have custom scripts or local changes:

1. **Rename your directory**:
   ```bash
   cd src
   mv content-scripts page-scripts
   ```

2. **Update imports** in your custom scripts:
   ```typescript
   // Old
   import { SCRIPTS_CONFIG } from "@/content-scripts/scripts";
   
   // New
   import { SCRIPTS_CONFIG } from "@/page-scripts/scripts";
   ```

3. **Update any references** in your custom build scripts or tooling

4. **Rebuild**:
   ```bash
   npm run build
   ```

## New Selector Type: `class`

### What Changed

Added support for space-separated class names in selectors.

### Why This Change

Sites like Instagram and Facebook use multiple generated class names on elements. The new `class` type makes targeting these easier.

### Before (Workaround)

```json
{
  "selector": ".x1dr59a3.x13vifvy.x7vhb2i",
  "type": "css"
}
```

### After (Better)

```json
{
  "selector": "x1dr59a3 x13vifvy x7vhb2i",
  "type": "class"
}
```

### Migration Steps

1. **Update `selectors.json`** if you're using multi-class selectors:
   - Change type from `css` to `class`
   - Remove dots (.) from class names
   - Separate classes with spaces

2. **Example conversion**:
   ```diff
   - { "selector": ".my-class.another-class", "type": "css" }
   + { "selector": "my-class another-class", "type": "class" }
   ```

## URL Pattern Changes

### What Changed

URL patterns now handle query parameters correctly.

### Why This Change

Sites with query strings (e.g., `?theme=dark`, `?hl=en`) weren't matching properly.

### Before

```typescript
urlPattern: "instagram\\.com/?$"  // ❌ Fails with ?theme=dark
```

### After

```typescript
urlPattern: "instagram\\.com/?(?:\\?.*)?$"  // ✅ Works with query params
```

### Migration Steps

If you have custom site configs:

1. **Update patterns** in `*_config.ts` files:
   ```typescript
   // Old pattern
   urlPattern: "mysite\\.com/?$"
   
   // New pattern (handles query params)
   urlPattern: "mysite\\.com/?(?:\\?.*)?$"
   ```

2. **Test your patterns**:
   ```bash
   # In browser console on target site
   console.log(window.location.href);
   // Verify your regex matches it
   ```

## Site-Specific Tab Refresh

### What Changed

Settings changes now only refresh tabs for the affected site.

### Why This Change

- **Better UX**: Don't reload unrelated tabs
- **Faster**: Less work for browser
- **Safer**: Preserves state in other tabs

### For Extension Users

No action needed! This just works better automatically.

### For Developers

If you're extending the settings system:

```typescript
// Old way (refreshes all tabs)
chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED' });

// New way (only refreshes relevant tabs)
chrome.runtime.sendMessage({ 
  type: 'SETTINGS_CHANGED',
  siteId: 'youtube'  // Only YouTube tabs refresh
});
```

## Build Configuration Changes

### What Changed

Vite config now skips `*_config.ts` files from compilation.

### Why This Change

Config files are imported by the service worker (bundled by Vite), not injected as scripts.

### Impact

- **Faster builds**: Fewer files to process
- **Fewer errors**: No more "file not found" issues
- **Cleaner output**: Only actual page scripts in dist/

### Migration Steps

If you have custom config files:

1. **Name them correctly**: Use `*_config.ts` suffix
2. **Import them** in `src/page-scripts/scripts.ts`:
   ```typescript
   import { MY_SITE_CONFIG } from "./mysite/mysite_config";
   ```
3. **Don't inject them** - they're bundled into service-worker.js

## Adding New Sites (Updated Process)

### Old Way

1. Edit `config/scripts.ts`
2. Create scripts in `src/content-scripts/`
3. Manually add to Vite config
4. Update manifest permissions

### New Way

1. Create `src/page-scripts/mysite/mysite_config.ts`
2. Import in `src/page-scripts/scripts.ts`
3. Create scripts in `src/page-scripts/mysite/`
4. Build automatically includes them
5. Update manifest permissions

The build process now discovers scripts automatically via the config imports!

## Breaking Changes

### None! 🎉

All changes are backwards compatible for end users. Only internal structure changed.

### For Forks/Contributors

If you've forked the repo or have custom modifications:

1. Rename `content-scripts/` → `page-scripts/`
2. Update import paths
3. Review URL patterns if you added custom sites
4. Rebuild and test

## Need Help?

- Check the [CHANGELOG.md](./CHANGELOG.md) for detailed changes
- Read the updated guides in `docs/`
- Look at example implementations in `src/page-scripts/`
- Open an issue for migration problems

## Quick Migration Checklist

- [ ] Rename `content-scripts/` to `page-scripts/`
- [ ] Update import statements
- [ ] Fix URL patterns to handle query params
- [ ] Convert multi-class selectors to use `class` type
- [ ] Update custom build scripts if any
- [ ] Test all custom scripts
- [ ] Rebuild extension
- [ ] Test in browser

---

**Last Updated**: March 25, 2026
