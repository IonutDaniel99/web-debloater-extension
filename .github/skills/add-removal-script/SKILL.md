---
name: add-removal-script
description: 'Add a new content removal script to an existing site (YouTube, GitHub, Instagram). Guides through creating the script file, updating config, and adding selectors. Interactive workflow that asks for all required details and creates all necessary files.'
argument-hint: 'Brief description of what to remove (e.g., "hide reels button on Instagram")'
---

# Add Removal Script to Site

Guided workflow for adding a new content removal script to an existing site in the Web Debloater & Enhancer extension.

## When to Use

- Adding a new element removal feature to YouTube, GitHub, or Instagram
- Creating a script that hides/removes unwanted UI elements
- Adding zone-specific content removal (home page, subscriptions, etc.)

**Do NOT use for:**
- Adding new sites (use manual process)
- Enhancement scripts that add functionality
- Modifying existing scripts (edit directly)

## What This Skill Does

This skill will:
1. ✅ Ask you for all required details interactively
2. ✅ Create the TypeScript removal script file
3. ✅ Update the site's config file with script registration
4. ✅ Add selector to `config/selectors.json`
5. ✅ Provide browser console command to test selector
6. ✅ Give clear next steps for building and testing

## Procedure

### Step 1: Gather Information

Ask the user these questions in order:

#### Q1: Which site?
```
Which site is this script for?
1. YouTube
2. GitHub  
3. Instagram

Enter number (1-3):
```

Store as: `site` (youtube/github/instagram)

#### Q2: What does it remove?
```
What does this script remove? (e.g., "Reels button", "Trending sidebar")
```

Store as: `featureName`

#### Q3: Where should it run?
```
Where should this script run?
1. On all pages of {site}
2. On a specific page/path only

Enter number (1-2):
```

If 2, ask:
```
What is the URL pattern regex? (e.g., "youtube\.com/watch.*" for video pages)
Tip: Use \. for dots, .* for wildcards
```

Store as: `urlPattern` (or null if all pages)
Store as: `pathDescription` (e.g., "watch pages", "home", "subscriptions")

#### Q4: Script location
```
Where should this script be saved?
Examples:
  - youtube/remove/shorts/  (for shorts-related features)
  - instagram/remove/reels/ (for reels features)
  - github/remove/sidebar/  (for sidebar features)

Path (relative to src/page-scripts/{site}/): 
```

Store as: `scriptDir` (e.g., "remove/reels/")

#### Q5: Exact filename
```
Exact filename for the script (without .ts extension)?
Convention: camelCase starting with action verb
Examples: hideReelsButton, removeTrendingSidebar, hideProfileContainer

Filename:
```

Store as: `scriptFilename` (e.g., "hideReelsButton")

#### Q6: Selector details
```
What CSS selector, XPath, or element ID targets the element?
Example: .reel-button, //div[@class='trending'], shorts-shelf

Selector:
```

Store as: `selectorValue`

```
What type of selector is this?
1. css (CSS selector - most common)
2. xpath (XPath expression)
3. id (Element ID)
4. class (Space-separated class names)

Enter number (1-4):
```

Store as: `selectorType` (css/xpath/id/class)

#### Q7: Selector path (with suggestion)
Based on `scriptDir`, suggest a selector path:
- If scriptDir is `remove/shorts/` → suggest `{site}.shorts`
- If scriptDir is `remove/reels/home/` → suggest `{site}.reels.home`
- If scriptDir is `remove/sidebar/` → suggest `{site}.sidebar`

```
Suggested selector path: {site}.{derived_from_scriptDir}

This path is used in selectors.json and script code.
Examples:
  - youtube.shorts.button
  - instagram.reels.home
  - github.sidebar.trending

Use suggestion? (y/n):
```

If n, ask:
```
Enter custom selector path (dot notation):
```

Store as: `selectorPath`

### Step 2: Validate & Confirm

Show summary:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Site:           {site}
Feature:        {featureName}
Script ID:      {scriptFilename}
Runs on:        {urlPattern or "all pages"}
File location:  src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts
Selector:       {selectorValue} (type: {selectorType})
Selector path:  {selectorPath}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with creation? (y/n):
```

### Step 3: Test Selector (Before Creating Files)

Provide test command:
```
🧪 TEST YOUR SELECTOR FIRST

Before creating files, verify your selector works:

1. Open {site} in your browser
2. Navigate to the target page
3. Open Developer Tools (F12)
4. Run this in the Console:

   {generateTestCommand(selectorType, selectorValue)}

You should see the elements you want to remove.
If you see 0 elements or wrong elements, adjust your selector.

Press Enter when ready to continue...
```

### Step 4: Create Files

Create 3 files:

#### File 1: TypeScript Script
**Path**: `src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts`

**Content**:
```typescript
/**
 * {featureName}
 * Removes {featureName} from {site} {pathDescription or "pages"}
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="{calculateRelativePath}/core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = '{capitalize(site)}';
  const SCRIPT_ID = '{scriptFilename}';

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // Get selectors from storage
  const SELECTORS = window.Debloater.getSelectors('{selectorPath}');

  // Initial removal
  const removed = window.Debloater.deleteElements(SELECTORS);
  if (removed > 0) {
    console.log(`[${APP_NAME}][${SCRIPT_ID}] Removed ${removed} elements`);
  }

  // Observe for dynamic changes (for SPAs)
  if (SELECTORS && (Array.isArray(SELECTORS) ? SELECTORS.length > 0 : true)) {
    window.Debloater.observeAndRemove(SELECTORS);
  }

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Active`);
})();
```

#### File 2: Update Site Config
**Path**: `src/page-scripts/{site}/{site}_config.ts`

Add to appropriate array:
- If `urlPattern` is null → add to `defaultScripts`
- If `urlPattern` exists → add to `pathScripts`

**New entry**:
```typescript
{
  id: "{scriptFilename}",
  name: "{featureName}",
  description: "Remove {featureName} from {site} {pathDescription or 'pages'}",
  scriptPath: "{site}/{scriptDir}{scriptFilename}.js",
  {urlPattern ? `urlPattern: "${urlPattern}",` : ''}
  type: "removal",
  defaultEnabled: false,
}
```

#### File 3: Update Selectors
**Path**: `config/selectors.json`

Add selector following the path structure:
```json
// Navigate to the right location in JSON based on selectorPath
// e.g., "youtube.shorts.button" → youtube → shorts → button

{
  "selector": "{selectorValue}",
  "type": "{selectorType}"
}
```

### Step 5: Report Success & Next Steps

```
✅ FILES CREATED SUCCESSFULLY!

📁 Created:
  • src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts
  
📝 Updated:
  • src/page-scripts/{site}/{site}_config.ts
  • config/selectors.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Review the generated files for correctness

2. Build the extension:
   npm run build

3. Reload extension in Chrome:
   chrome://extensions/ → Click reload icon

4. Test on {site}:
   • Open {site} settings page
   • Find "{featureName}" under Remove Content
   • Enable the toggle
   • Click "Apply Changes"
   • Verify the element is removed

5. Check console logs:
   • F12 → Console tab
   • Look for: [{capitalize(site)}][{scriptFilename}] messages

🐛 TROUBLESHOOTING:
   • Element not removed? Check selector in DevTools
   • Script not appearing? Verify config syntax
   • Build errors? Check TypeScript syntax

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Helper Functions

### generateTestCommand
```javascript
function generateTestCommand(type, selector) {
  switch(type) {
    case 'css':
      return `document.querySelectorAll('${selector}')`;
    case 'xpath':
      return `document.evaluate('${selector}', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength`;
    case 'id':
      return `document.getElementById('${selector}')`;
    case 'class':
      return `document.querySelectorAll('.${selector.split(' ').join('.')}')`;
  }
}
```

### calculateRelativePath
Based on `scriptDir`, calculate relative path to core:
- `remove/` → `../../../core/dom-utils.ts`
- `remove/shorts/` → `../../../../core/dom-utils.ts`
- `remove/reels/home/` → `../../../../../core/dom-utils.ts`

Count slashes in scriptDir + 2 for {site} and page-scripts.

### derivePathFromDir
```javascript
function derivePathFromDir(scriptDir) {
  // remove/shorts/ → shorts
  // remove/reels/home/ → reels.home
  // remove/sidebar/trending/ → sidebar.trending
  
  return scriptDir
    .replace(/^remove\//, '')
    .replace(/\/$/, '')
    .replace(/\//g, '.');
}
```

## Examples

### Example 1: YouTube Reels Button
```
Site: YouTube
Feature: Reels Button
Runs on: All YouTube pages
Script dir: remove/reels/
Filename: hideReelsButton
Selector: .reel-button
Type: css
Path: youtube.reels.button
```

### Example 2: Instagram Stories Home
```
Site: Instagram  
Feature: Stories Section (Home)
Runs on: instagram\.com/?(?:\?.*)?$
Script dir: remove/stories/home/
Filename: hideStoriesHome
Selector: x1s928wv xhkezso x1gmr53x
Type: class
Path: instagram.stories.home
```

### Example 3: GitHub Trending Sidebar
```
Site: GitHub
Feature: Trending Sidebar
Runs on: All GitHub pages
Script dir: remove/sidebar/
Filename: hideTrendingSidebar
Selector: //aside[@aria-label='Trending']
Type: xpath
Path: github.sidebar.trending
```

## Quality Checklist

Before finalizing:
- [ ] Script file has proper JSDoc comment
- [ ] Script ID matches filename
- [ ] Selector path is logical and matches convention
- [ ] URL pattern is tested if path-specific
- [ ] Config entry has all required fields
- [ ] Selectors.json has correct nesting
- [ ] Relative path to dom-utils is correct
- [ ] Test command provided to user
- [ ] Next steps are clear

## Edge Cases

**Multiple selectors**: 
If user wants multiple selectors, create array in selectors.json:
```json
[
  { "selector": "selector1", "type": "css" },
  { "selector": "selector2", "type": "xpath" }
]
```

**Nested paths**:
For deep paths like `youtube.watch.sidebar.recommended`, ensure proper nesting in selectors.json.

**Special characters**:
Remind user to escape special chars in regex patterns: `\.` for dots, `\/` for slashes.

## Anti-patterns to Avoid

❌ Creating enhancement scripts (out of scope)
❌ Modifying multiple sites at once (one at a time)
❌ Skipping selector testing (always test first)
❌ Using generic selector paths (be specific)
❌ Creating files without asking for confirmation

## Success Criteria

User should have:
✅ Working removal script that compiles
✅ Script registered in site config
✅ Selector added to selectors.json
✅ Clear understanding of how to test
✅ Knowledge of what to do if it doesn't work

---

**Remember**: Always ask questions interactively, never assume defaults. Make the user feel guided through each step.
