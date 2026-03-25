# Changelog

All notable changes to this project will be documented in this file.

## [2026.3.25] - March 25, 2026

### Added

#### Instagram Support
- **Instagram Integration**: Full support for Instagram with initial removal script
  - Created `src/page-scripts/instagram/` structure
  - Added `instagram_config.ts` with site configuration
  - Implemented `hideProfileContainerHome.ts` script for home page cleanup
  - Added Instagram icon (`public/icons/instagram.svg`)
  - Added Instagram page component (`src/webpage/pages/instagram.tsx`)

#### Selector System Enhancements
- **Class Selector Type**: New selector type for multi-class matching
  - Handles space-separated class names: `"x1dr59a3 x13vifvy x7vhb2i"`
  - Automatically converts to CSS selector: `.x1dr59a3.x13vifvy.x7vhb2i`
  - Essential for sites with generated class names (Instagram, Facebook, etc.)
  - Updated `src/core/dom-utils.ts` with class selector logic

#### Smart Tab Refresh
- **Site-Specific Refresh**: `refreshTabsForSite(siteId)` method
  - Only reloads tabs matching the site whose settings changed
  - Prevents unnecessary page reloads across all tabs
  - Improved UX when adjusting settings
  - Implementation in `src/core/script-injector.ts`

### Changed

#### Project Structure
- **Reorganization**: Renamed `content-scripts/` to `page-scripts/`
  - Better semantic naming for injected page scripts
  - Clearer distinction from Chrome's content scripts API
  - Updated all import paths and references
  - Moved config files to appropriate locations

#### URL Pattern Matching
- **Query Parameter Support**: Fixed URL patterns to handle query strings
  - Old: `instagram\.com/?$` (failed with `?theme=dark`)
  - New: `instagram\.com/?(?:\?.*)?$` (handles any query params)
  - Applied to YouTube and Instagram configs
  - Ensures scripts load correctly regardless of URL parameters

#### Build Configuration
- **Vite Config Improvements**:
  - Skip `*_config.ts` files from compilation (they're imported, not injected)
  - Simplified directory creation (single `dist/scripts` vs multiple subdirs)
  - Added Instagram to compilation pipeline
  - Proper recursive directory handling

#### Manifest Updates
- **Permissions**: Added Instagram host permissions
  - `*://*.instagram.com/*` added to `host_permissions`
  - Updated `web_accessible_resources` to include Instagram scripts
  - Version auto-increment system working correctly

#### Script Injection
- **Path Correction**: Fixed script injection paths
  - Changed from `content-scripts/` to `scripts/` prefix
  - Matches actual build output structure
  - Fixed DOM utils injection path
  - Improved error handling and logging

### Fixed

- URL pattern regex now handles query parameters correctly
- Build process no longer tries to compile config files
- Tab refresh only affects relevant tabs, not all open tabs
- Script injection paths align with build output directory structure
- Class-based selectors now work for multi-class elements

### Technical Details

#### Files Added
- `src/page-scripts/instagram/instagram_config.ts`
- `src/page-scripts/instagram/remove/home/hideProfileContainerHome.ts`
- `public/icons/instagram.svg`
- `src/webpage/pages/instagram.tsx`
- `docs/add-enhancement-for-page.md` (comprehensive guide)
- `docs/add-remove-content-for-page.md` (comprehensive guide)

#### Files Modified
- `src/core/dom-utils.ts` - Added class selector type
- `src/core/script-injector.ts` - Site-specific refresh, path fixes
- `src/core/service-worker.ts` - Handle siteId in settings changes
- `src/webpage/hooks/useSettings.ts` - Pass siteId when applying changes
- `vite.config.ts` - Build improvements, skip config files
- `config/selectors.json` - Added class type to schema
- `public/manifest.json` - Instagram permissions
- `README.md` - Updated features, added changelog
- `docs/README.md` - Updated structure references

#### Code Quality
- Added proper TypeScript types for new features
- Improved error handling in script injection
- Better logging for debugging selector loading
- Consistent naming conventions across codebase

### Developer Experience

- **Better Build Process**: Automatic exclusion of non-script TypeScript files
- **Clearer Structure**: `page-scripts/` naming makes purpose obvious
- **Comprehensive Docs**: Added detailed guides for adding new sites/features
- **Smart Refresh**: Faster development iteration with targeted tab reloads

### Performance

- **Reduced Tab Reloads**: Site-specific refresh saves unnecessary work
- **Efficient Class Matching**: Direct querySelectorAll for multi-class selectors
- **Optimized Build**: Skip unnecessary file compilations

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com/) principles.

### Categories
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes
