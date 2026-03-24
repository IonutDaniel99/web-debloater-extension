# Architecture Update: Site-Level URL Matching

## Summary of Changes

This update moves URL pattern matching from the zone level to the site level, allowing all zones for a site to run on all pages of that site.

## Why This Change?

**Previous Problem:**
- Each zone had its own URL pattern (e.g., reels only on `*://www.youtube.com/*`)
- Reels appear on multiple pages (home, subscriptions, search, watch)
- Required duplicate zones or overly broad patterns
- Scripts couldn't handle content that appears across multiple pages

**New Solution:**
- All YouTube zones run on `*://*.youtube.com/*`
- All GitHub zones run on `*://*.github.com/*`
- Scripts handle page-specific logic internally
- More flexible and matches real-world usage patterns

## Technical Changes

### 1. Config Structure (`config/zones.ts`)

**Before:**
```typescript
export interface Zone {
  urlPattern: string; // Each zone had its own pattern
  // ...
}

export interface Site {
  zones: Zone[];
  // No site-level pattern
}
```

**After:**
```typescript
export interface Zone {
  // No urlPattern - removed from zone level
  // ...
}

export interface Site {
  urlPattern: string; // Site-level pattern for ALL zones
  zones: Zone[];
}
```

### 2. URL Matcher (`src/core/url-matcher.ts`)

**Before:**
- Checked each zone's `urlPattern` individually
- Only returned zones with matching patterns

**After:**
- Checks site's `urlPattern` first
- Returns ALL zones for matching sites
- Zone scripts decide what to do based on page content

### 3. Manifest Permissions (`public/manifest.json`)

**Before:**
```json
"host_permissions": [
  "https://www.youtube.com/*",
  "https://github.com/*"
]
```

**After:**
```json
"host_permissions": [
  "*://*.youtube.com/*",  // All YouTube subdomains
  "*://*.github.com/*"     // All GitHub subdomains
]
```

### 4. Bundled Scripts (`src/core/bundled-scripts.ts`)

**New file** - Bundles content scripts with the extension for offline/initial use:
- Imports scripts using Vite's `?raw` import
- Loads scripts into storage on first install
- Provides fallback when GitHub is unavailable

### 5. Type Definitions (`src/vite-env.d.ts`)

**New file** - TypeScript declarations for Vite raw imports:
```typescript
declare module '*?raw' {
  const content: string;
  export default content;
}
```

## Script Behavior Changes

### Example: YouTube Reels Script

**Before:**
- Zone config: `urlPattern: '*://www.youtube.com/*'`
- Would only run on www subdomain
- Wouldn't run on music.youtube.com, etc.

**After:**
- Site config: `urlPattern: '*://*.youtube.com/*'`
- Runs on ALL YouTube pages (all subdomains)
- Script internally checks:
  ```javascript
  function getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path === '/feed/trending') return 'home';
    if (path.includes('/results')) return 'search';
    if (path.includes('/watch')) return 'watch';
    return 'other';
  }
  
  function shouldRemoveOnCurrentPage() {
    const page = getCurrentPage();
    if (page === 'home' && settings.hideOnHome) return true;
    if (page === 'search' && settings.hideInSearch) return true;
    return false;
  }
  ```

## Migration Guide

### For Extension Developers

If adding a new zone:

1. **Don't add a `urlPattern` to the zone config** - it's now at the site level
2. **Handle page-specific logic in the script** using `window.location` checks
3. **Test on multiple pages** since the script will run site-wide

### For Users

No migration needed! The extension automatically:
- Loads bundled scripts on first install
- Maintains existing settings
- Works offline without GitHub configured

## Benefits

✅ **More flexible**: Scripts can target content that appears on multiple pages
✅ **Less configuration**: No need to specify URL patterns for each zone
✅ **Better UX**: Reels removal works everywhere reels appear
✅ **Simpler logic**: URL matching happens once at site level
✅ **Subdomain support**: Works on music.youtube.com, gist.github.com, etc.

## Testing Checklist

- [x] TypeScript compiles without errors
- [x] Extension builds successfully
- [x] Manifest loads in Chrome
- [x] Bundled scripts load on first install
- [x] Site-level URL matching works
- [x] Scripts run on all pages of their site
- [ ] Test on YouTube (home, subscriptions, search, watch)
- [ ] Test on GitHub (repo, PR, issues, gist)
- [ ] Verify settings work correctly
- [ ] Verify auto-update still functions

## Files Modified

1. `config/zones.ts` - Moved `urlPattern` to site level
2. `src/core/url-matcher.ts` - Updated to check site patterns
3. `public/manifest.json` - Updated host permissions for subdomains
4. `src/core/update-checker.ts` - Enhanced with bundled scripts loading
5. `src/core/bundled-scripts.ts` - **NEW** - Bundles scripts with extension
6. `src/vite-env.d.ts` - **NEW** - Type definitions for raw imports
7. `README.md` - Updated documentation
8. `QUICKSTART.md` - Updated testing instructions

## Version

- Updated to: `1.0.2`
- Release date: March 24, 2026
