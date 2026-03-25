---
name: add-new-site
description: 'Add a completely new site to the Web Debloater extension (e.g., Twitter, Reddit, Facebook). Creates all necessary structure: config, page component, icon, manifest permissions, and example script. Complete setup workflow.'
argument-hint: 'Name of site to add (e.g., "Twitter", "Reddit")'
---

# Add New Site to Extension

Comprehensive workflow for adding a completely new site to the Web Debloater extension.

## When to Use

- Adding support for a new website (Twitter, Reddit, Facebook, TikTok, etc.)
- Creating the complete structure for a new site
- Setting up all required files and configurations

**Do NOT use for:**
- Adding scripts to existing sites (use add-removal-script or add-enhancement-script)
- Modifying existing sites (edit directly)

## What This Skill Does

This skill will create:
1. ✅ Site configuration file
2. ✅ Site page component (React/TypeScript)
3. ✅ Directory structure in page-scripts
4. ✅ Example removal script (optional)
5. ✅ Icon (placeholder or custom)
6. ✅ Update manifest permissions
7. ✅ Update central scripts registry
8. ✅ Update page routing
9. ✅ Update sidebar navigation

## ⚠️ Important Note

This is a **complex multi-file operation**. Make sure you:
- Have a clear understanding of the site's URL structure
- Know what you want to remove/add initially
- Have tested the site's HTML structure
- Are ready to implement custom logic after setup

## Procedure

### Step 1: Gather Site Information

#### Q1: Site name
```
What is the site name? (e.g., "Twitter", "Reddit", "Facebook")
Use proper capitalization.

Site name:
```

Store as: `siteName` (e.g., "Twitter")
Derive: `siteId` = lowercase(siteName) (e.g., "twitter")

#### Q2: Site URL
```
What is the base URL of this site?
Examples: twitter.com, reddit.com, facebook.com

Base URL (without https://):
```

Store as: `baseUrl` (e.g., "twitter.com")

#### Q3: URL pattern
```
What regex pattern should match all pages of this site?
Common patterns:
  - twitter\\.com        (basic)
  - twitter\\..*/.*      (with subdomains and paths)
  - (twitter|x)\\.com    (multiple domains)

URL Pattern (regex):
```

Store as: `urlPattern` (e.g., "twitter\\.com")

#### Q4: Icon
```
Do you have a custom icon SVG for this site?
1. Yes, I'll provide the SVG content
2. No, use a placeholder

Enter number (1-2):
```

If 1, ask:
```
Paste the SVG content (full <svg> tag):
```

Store as: `iconSvg` (or generate placeholder)

#### Q5: Primary color
```
What is the brand's primary color? (for UI theming)
Examples: #1DA1F2 (Twitter blue), #FF4500 (Reddit orange)

Hex color:
```

Store as: `primaryColor`

#### Q6: Initial script
```
Do you want to create an example removal script now?
This helps test that everything is working.

1. Yes, create example script
2. No, just create the structure

Enter number (1-2):
```

Store as: `createExample`

If 1, gather script details (simplified):
```
What should the example script remove? (e.g., "Trending sidebar")
Feature name:
```

```
CSS selector for this element:
```

Store as: `exampleFeature`, `exampleSelector`

### Step 2: Validate & Confirm

Show summary:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEW SITE CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Site Name:      {siteName}
Site ID:        {siteId}
Base URL:       {baseUrl}
URL Pattern:    {urlPattern}
Color:          {primaryColor}
Icon:           {iconSvg ? 'Custom SVG' : 'Placeholder'}
Example Script: {createExample ? exampleFeature : 'None'}

FILES TO CREATE:
  • src/page-scripts/{siteId}/{siteId}_config.ts
  • src/page-scripts/{siteId}/remove/ (directory)
  • src/page-scripts/{siteId}/add/ (directory)
  • src/webpage/pages/{siteId}.tsx
  • public/icons/{siteId}.svg
  {createExample ? `• src/page-scripts/{siteId}/remove/example.ts` : ''}

FILES TO UPDATE:
  • src/page-scripts/scripts.ts
  • src/webpage/configs/pages.tsx
  • public/manifest.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This will create {createExample ? '13' : '12'} file operations.
Proceed? (y/n):
```

### Step 3: Create Directory Structure

Create directories:
```
src/page-scripts/{siteId}/
src/page-scripts/{siteId}/remove/
src/page-scripts/{siteId}/add/
```

### Step 4: Create Site Config File

**Path**: `src/page-scripts/{siteId}/{siteId}_config.ts`

**Content**:
```typescript
import { SiteConfig } from "../scripts";

/**
 * {siteName.toUpperCase()} CONFIG
 */
export const {siteId.toUpperCase()}_CONFIG: SiteConfig = {
  id: "{siteId}",
  name: "{siteName}",
  urlPatternBase: "{urlPattern}",
  defaultScripts: [
    {createExample && exampleFeature ? `
    {
      id: "removeExample",
      name: "Remove {exampleFeature}",
      description: "Remove {exampleFeature} from {siteName}",
      scriptPath: "{siteId}/remove/example.js",
      defaultEnabled: false,
      type: "removal",
    },
    ` : '// Add default scripts here'}
  ],
  pathScripts: [
    // Add path-specific scripts here
  ],
};
```

### Step 5: Create Example Script (if requested)

If `createExample`, create:

**Path**: `src/page-scripts/{siteId}/remove/example.ts`

**Content**:
```typescript
/**
 * Remove {exampleFeature}
 * Example removal script for {siteName}
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = '{siteName}';
  const SCRIPT_ID = 'removeExample';

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Initializing...\`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(\`[\${APP_NAME}][\${SCRIPT_ID}] Debloater utilities not loaded!\`);
    return;
  }

  // Get selectors from storage
  const SELECTORS = window.Debloater.getSelectors('{siteId}.example');

  // Initial removal
  const removed = window.Debloater.deleteElements(SELECTORS);
  if (removed > 0) {
    console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Removed \${removed} elements\`);
  }

  // Observe for dynamic changes
  if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SELECTORS);
  }

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Active\`);
})();
```

### Step 6: Create Page Component

**Path**: `src/webpage/pages/{siteId}.tsx`

**Content**:
```typescript
import { Button } from '@/webpage/components/ui/button';
import { SCRIPTS_CONFIG } from '@/page-scripts/scripts';
import { useSettings } from '@/webpage/hooks/useSettings';
import { cn } from '@/webpage/lib/utils';
import { Trash2, Sparkles, Save } from 'lucide-react';
import { SiteIcon } from '@/webpage/components/SiteIcon';
import { RenderScriptGroup } from '@/webpage/components/RenderScriptGroup';

const SITE_ID = '{siteId}';

export function {capitalize(siteId)}Page() {
  const {
    versions,
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  const site = SCRIPTS_CONFIG.find(s => s.id === SITE_ID);
  
  if (!site) {
    return <div>Site configuration not found</div>;
  }

  const allScripts = [...site.defaultScripts, ...site.pathScripts];
  const siteHasPendingChanges = hasPendingChanges(site.id);

  // Group scripts by type
  const removalScripts = allScripts.filter(s => s.type === 'removal');
  const enhancementScripts = allScripts.filter(s => s.type === 'enhancement');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-[{primaryColor}]/10 to-[{primaryColor}]/5",
              "ring-1 ring-[{primaryColor}]/20"
            )}>
              <SiteIcon siteId={SITE_ID} size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{site.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage {allScripts.length} script{allScripts.length !== 1 ? 's' : ''} 
                {removalScripts.length > 0 && \` • \${removalScripts.length} removal\${removalScripts.length !== 1 ? 's' : ''}\`}
                {enhancementScripts.length > 0 && \` • \${enhancementScripts.length} enhancement\${enhancementScripts.length !== 1 ? 's' : ''}\`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
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

      {/* Apply Button (Floating) */}
      {siteHasPendingChanges && (
        <div className={cn(
          "sticky bottom-0 border-t bg-card/95 backdrop-blur-sm",
          "shadow-2xl shadow-black/10"
        )}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Unsaved changes
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isExtension 
                    ? 'Changes will be applied and active tabs will be refreshed'
                    : 'Demo mode - changes are simulated'}
                </p>
              </div>
              <Button
                onClick={() => handleApplyChanges(site.id, site.name)}
                className={cn(
                  "gap-2 bg-primary hover:bg-primary/90",
                  "shadow-lg shadow-primary/25"
                )}
              >
                <Save className="w-4 h-4" />
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 7: Create Icon

**Path**: `public/icons/{siteId}.svg`

**Content**:
```svg
{iconSvg || generatePlaceholderIcon(siteName, primaryColor)}
```

Placeholder icon template:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="{primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <text x="12" y="16" text-anchor="middle" fill="{primaryColor}" font-size="10" font-weight="bold">{siteName[0]}</text>
</svg>
```

### Step 8: Update Central Scripts Registry

**Path**: `src/page-scripts/scripts.ts`

Add import:
```typescript
import { {siteId.toUpperCase()}_CONFIG } from "./{siteId}/{siteId}_config";
```

Add to export array:
```typescript
export const SCRIPTS_CONFIG: SiteConfig[] = [
  YOUTUBE_CONFIG,
  GITHUB_CONFIG,
  INSTAGRAM_CONFIG,
  {siteId.toUpperCase()}_CONFIG, // ← Add here
];
```

### Step 9: Update Page Routing

**Path**: `src/webpage/configs/pages.tsx`

Add import:
```typescript
import { {capitalize(siteId)}Page } from '@/webpage/pages/{siteId}';
```

Add icon import:
```typescript
import {capitalize(siteId)}Icon from '@/../public/icons/{siteId}.svg?react';
```

Add to pages array:
```typescript
export const pages: PageConfig[] = [
  // ... existing pages
  {
    id: '{siteId}',
    name: '{siteName}',
    path: '/{siteId}',
    icon: {capitalize(siteId)}Icon,
    component: {capitalize(siteId)}Page,
  },
];
```

### Step 10: Update Manifest Permissions

**Path**: `public/manifest.json`

Add to `host_permissions`:
```json
"*://*.{baseUrl}/*"
```

Add to `web_accessible_resources`:
```json
"scripts/{siteId}/**/*.js"
```

### Step 11: Update Selectors (if example created)

If `createExample`, update **`config/selectors.json`**:

Add:
```json
"{siteId}": {
  "example": {
    "selector": "{exampleSelector}",
    "type": "css"
  }
}
```

### Step 12: Report Success & Next Steps

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SITE ADDED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Created {totalFiles} files:

STRUCTURE:
  • src/page-scripts/{siteId}/{siteId}_config.ts
  • src/page-scripts/{siteId}/remove/ (directory)
  • src/page-scripts/{siteId}/add/ (directory)
  {createExample ? `• src/page-scripts/{siteId}/remove/example.ts` : ''}
  
UI:
  • src/webpage/pages/{siteId}.tsx
  • public/icons/{siteId}.svg
  
UPDATED:
  • src/page-scripts/scripts.ts
  • src/webpage/configs/pages.tsx  
  • public/manifest.json
  {createExample ? `• config/selectors.json` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Build the extension:
   npm run build

2. Reload extension in Chrome:
   chrome://extensions/ → Click reload icon

3. Test the new site appears in UI:
   • Open extension settings
   • Verify "{siteName}" appears in sidebar
   • Click on it to see the page

4. Test on {baseUrl}:
   • Navigate to https://{baseUrl}
   • Open DevTools (F12) → Console
   • Look for: [{siteName}] initialization logs
   {createExample ? `• Enable the example script and test removal` : ''}

5. Add more scripts:
   Use /add-removal-script or /add-enhancement-script
   to add features for {siteName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update these files with {siteName} info:
  • README.md - Add to supported sites list
  • docs/README.md - Add examples if needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐛 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Icon not showing?
  → Check SVG syntax in public/icons/{siteId}.svg

Page not appearing?
  → Verify all imports in pages.tsx

Scripts not loading?
  → Check manifest.json permissions
  → Verify URL pattern matches actual URLs

Build errors?
  → Run: npm run build
  → Check TypeScript errors
  → Verify all file paths

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Quality Checklist

Before finalizing site creation:
- [ ] Site ID is lowercase and URL-safe
- [ ] URL pattern accurately matches all site pages
- [ ] Icon exists and is valid SVG
- [ ] Config file has proper TypeScript types
- [ ] Page component follows existing pattern
- [ ] Manifest permissions are correct
- [ ] All imports use correct paths
- [ ] Build completes without errors

## Common Site Patterns

### Twitter/X
```
Site: Twitter
ID: twitter
URL: twitter.com or x.com
Pattern: (twitter|x)\\.com
```

### Reddit
```
Site: Reddit
ID: reddit
URL: reddit.com
Pattern: reddit\\.com
```

### TikTok
```
Site: TikTok
ID: tiktok
URL: tiktok.com
Pattern: tiktok\\.com
```

### Facebook
```
Site: Facebook
ID: facebook
URL: facebook.com
Pattern: facebook\\.com
```

## Anti-patterns to Avoid

❌ Creating sites with spaces in ID (use lowercase, no spaces)
❌ Forgetting to update manifest permissions
❌ Not testing the URL pattern first
❌ Using overly broad URL patterns (matches too much)
❌ Forgetting to add to scripts registry
❌ Creating without example script (harder to test)

## Success Criteria

User should have:
✅ Complete site structure created
✅ Site appears in extension UI
✅ Example script working (if created)
✅ Build completes successfully
✅ Clear next steps documented

---

**Remember**: This creates the foundation. User still needs to add meaningful scripts using other skills!
