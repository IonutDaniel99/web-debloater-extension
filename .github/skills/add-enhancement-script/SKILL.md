---
name: add-enhancement-script
description: 'Add a new enhancement/feature script to an existing site (YouTube, GitHub, Instagram). Guides through creating scripts that add functionality like buttons, shortcuts, or UI improvements. Interactive workflow that creates all necessary files.'
argument-hint: 'Brief description of enhancement to add (e.g., "add go to top button on GitHub")'
---

# Add Enhancement Script to Site

Guided workflow for adding a new enhancement/feature script to an existing site in the Web Debloater extension.

## When to Use

- Adding new functionality/features to YouTube, GitHub, or Instagram
- Creating scripts that add UI elements (buttons, shortcuts, overlays)
- Enhancing existing pages with useful tools

**Do NOT use for:**
- Removing/hiding elements (use add-removal-script instead)
- Adding new sites (use add-new-site instead)
- Modifying existing scripts (edit directly)

## What This Skill Does

This skill will:
1. ✅ Ask you for all required details interactively
2. ✅ Create the TypeScript enhancement script file
3. ✅ Update the site's config file with script registration
4. ✅ Provide implementation guidance for common patterns
5. ✅ Give clear next steps for building and testing

## Procedure

### Step 1: Gather Information

Ask the user these questions in order:

#### Q1: Which site?
```
Which site is this enhancement for?
1. YouTube
2. GitHub  
3. Instagram

Enter number (1-3):
```

Store as: `site` (youtube/github/instagram)

#### Q2: What does it add?
```
What does this enhancement do? (e.g., "Go to Top button", "Keyboard shortcuts")
```

Store as: `featureName`

#### Q3: Enhancement type
```
What type of enhancement is this?
1. Button/UI element (adds visible element to page)
2. Keyboard shortcut (adds hotkey functionality)
3. Auto-feature (runs automatically, no UI)
4. Other/Custom

Enter number (1-4):
```

Store as: `enhancementType` (button/shortcut/auto/custom)

#### Q4: Where should it run?
```
Where should this enhancement run?
1. On all pages of {site}
2. On a specific page/path only

Enter number (1-2):
```

If 2, ask:
```
What is the URL pattern regex? (e.g., "github\.com/.*/pull/.*" for PR pages)
Tip: Use \. for dots, .* for wildcards
```

Store as: `urlPattern` (or null if all pages)
Store as: `pathDescription` (e.g., "PR pages", "home", "watch pages")

#### Q5: Script location
```
Where should this script be saved?
Examples:
  - youtube/add/navigation/  (for navigation features)
  - github/add/shortcuts/    (for keyboard shortcuts)
  - instagram/add/tools/     (for utility tools)

Path (relative to src/page-scripts/{site}/): 
```

Store as: `scriptDir` (e.g., "add/navigation/")

#### Q6: Exact filename
```
Exact filename for the script (without .ts extension)?
Convention: camelCase starting with action verb
Examples: goToTopButton, addKeyboardShortcuts, autoHideElements

Filename:
```

Store as: `scriptFilename` (e.g., "goToTopButton")

#### Q7: Implementation needs
```
Does your enhancement need to wait for specific elements to appear?
Examples: 
  - Wait for main content area before adding button
  - Wait for video player before adding controls
  
1. Yes, I'll specify a selector to wait for
2. No, run immediately

Enter number (1-2):
```

If 1, ask:
```
CSS selector to wait for (e.g., "main", "#content", ".video-player"):
```

Store as: `waitForSelector` (or null)

### Step 2: Validate & Confirm

Show summary:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Site:           {site}
Enhancement:    {featureName}
Type:           {enhancementType}
Script ID:      {scriptFilename}
Runs on:        {urlPattern or "all pages"}
File location:  src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts
Wait for:       {waitForSelector or "nothing (runs immediately)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with creation? (y/n):
```

### Step 3: Provide Implementation Guidance

Based on `enhancementType`, show pattern:

**For Button/UI Element:**
```
💡 IMPLEMENTATION TIPS - Button/UI Element

Your script will create and add an element to the page.
Common pattern:

1. Create the element
2. Style it (inline or classes)
3. Add event listener
4. Append to target location

Example structure included in generated file.
```

**For Keyboard Shortcut:**
```
💡 IMPLEMENTATION TIPS - Keyboard Shortcut

Your script will listen for key combinations.
Common pattern:

1. Add keydown event listener
2. Check key combination (e.g., Ctrl+K)
3. Execute action

Example structure included in generated file.
```

**For Auto-feature:**
```
💡 IMPLEMENTATION TIPS - Auto Feature

Your script runs automatically without user interaction.
Common pattern:

1. Observe DOM changes
2. Apply modifications when conditions met
3. Use MutationObserver for dynamic content

Example structure included in generated file.
```

### Step 4: Create Files

Create 2 files:

#### File 1: TypeScript Script
**Path**: `src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts`

**Content** (varies by type):

**For Button/UI Element:**
```typescript
/**
 * {featureName}
 * Adds {featureName} to {site} {pathDescription or "pages"}
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

  {waitForSelector ? `
  // Wait for target element
  window.Debloater.waitForElement('${waitForSelector}')
    .then(() => {
      addEnhancement();
    })
    .catch((error) => {
      console.error(\`[\${APP_NAME}][\${SCRIPT_ID}] Target element not found:\`, error);
    });
  ` : `
  // Run immediately
  addEnhancement();
  `}

  function addEnhancement() {
    // Create the button/element
    const button = document.createElement('button');
    button.id = '{scriptFilename}-btn';
    button.textContent = '{featureName}';
    button.style.cssText = \`
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: background 0.2s;
    \`;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = '#2563eb';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = '#3b82f6';
    });
    
    // Add click handler
    button.addEventListener('click', () => {
      // TODO: Implement your logic here
      // Example: window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Button clicked\`);
    });
    
    // Add to page
    document.body.appendChild(button);
    
    console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Enhancement added\`);
  }

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Active\`);
})();
```

**For Keyboard Shortcut:**
```typescript
/**
 * {featureName}
 * Adds {featureName} to {site} {pathDescription or "pages"}
 * 
 * This script only runs if enabled in extension settings.
 */

(function() {
  'use strict';

  const APP_NAME = '{capitalize(site)}';
  const SCRIPT_ID = '{scriptFilename}';

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Initializing...\`);

  // Add keyboard shortcut
  document.addEventListener('keydown', (event) => {
    // TODO: Customize key combination
    // Example: Ctrl+K or Cmd+K
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      
      // TODO: Implement your logic here
      console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Shortcut triggered\`);
    }
  });

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Active\`);
})();
```

**For Auto-feature:**
```typescript
/**
 * {featureName}
 * {featureName} on {site} {pathDescription or "pages"}
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="{calculateRelativePath}/core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = '{capitalize(site)}';
  const SCRIPT_ID = '{scriptFilename}';

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Initializing...\`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(\`[\${APP_NAME}][\${SCRIPT_ID}] Debloater utilities not loaded!\`);
    return;
  }

  // Run initial enhancement
  applyEnhancement();

  // Observe for dynamic changes
  const observer = new MutationObserver(() => {
    applyEnhancement();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  function applyEnhancement() {
    // TODO: Implement your logic here
    // Example: Find elements and modify them
    console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Applying enhancement\`);
  }

  console.log(\`[\${APP_NAME}][\${SCRIPT_ID}] Active\`);
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
  description: "Add {featureName} to {site} {pathDescription or 'pages'}",
  scriptPath: "{site}/{scriptDir}{scriptFilename}.js",
  {urlPattern ? `urlPattern: "${urlPattern}",` : ''}
  type: "enhancement",
  defaultEnabled: false,
}
```

### Step 5: Report Success & Next Steps

```
✅ FILES CREATED SUCCESSFULLY!

📁 Created:
  • src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts
  
📝 Updated:
  • src/page-scripts/{site}/{site}_config.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 TODO: IMPLEMENT YOUR LOGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The script file has been created with a template.
You need to implement your specific logic:

1. Open: src/page-scripts/{site}/{scriptDir}{scriptFilename}.ts

2. Find the TODO comments

3. Implement your enhancement logic

4. Customize styling, behavior, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Implement the TODO sections in the script file

2. Build the extension:
   npm run build

3. Reload extension in Chrome:
   chrome://extensions/ → Click reload icon

4. Test on {site}:
   • Open {site} settings page
   • Find "{featureName}" under Enhancements
   • Enable the toggle
   • Click "Apply Changes"
   • Navigate to {site} and verify it works

5. Check console logs:
   • F12 → Console tab
   • Look for: [{capitalize(site)}][{scriptFilename}] messages

💡 TIPS:
   • Use window.Debloater helpers for DOM manipulation
   • Test on different pages if URL-specific
   • Add proper error handling
   • Consider dark mode styling if adding UI

🐛 TROUBLESHOOTING:
   • Enhancement not appearing? Check console for errors
   • Script not running? Verify config syntax and URL pattern
   • Build errors? Check TypeScript syntax

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Helper Functions

### calculateRelativePath
Based on `scriptDir`, calculate relative path to core:
- `add/` → `../../../core/dom-utils.ts`
- `add/navigation/` → `../../../../core/dom-utils.ts`
- `add/tools/utils/` → `../../../../../core/dom-utils.ts`

Count slashes in scriptDir + 2 for {site} and page-scripts.

## Examples

### Example 1: Go to Top Button on GitHub
```
Site: GitHub
Enhancement: Go to Top Button
Type: Button/UI element
Runs on: All GitHub pages
Script dir: add/navigation/
Filename: goToTopButton
Wait for: body
```

### Example 2: Video Speed Shortcuts on YouTube
```
Site: YouTube
Enhancement: Video Speed Keyboard Shortcuts
Type: Keyboard shortcut
Runs on: youtube\.com/watch.*
Script dir: add/shortcuts/
Filename: videoSpeedShortcuts
Wait for: .video-stream
```

### Example 3: Auto-expand Comments on Instagram
```
Site: Instagram  
Enhancement: Auto-expand Comments
Type: Auto-feature
Runs on: instagram\.com/p/.*
Script dir: add/auto/
Filename: autoExpandComments
Wait for: article
```

## Quality Checklist

Before finalizing:
- [ ] Script file has proper JSDoc comment
- [ ] Script ID matches filename
- [ ] Template includes helpful TODO comments
- [ ] URL pattern is tested if path-specific
- [ ] Config entry has all required fields
- [ ] Relative path to dom-utils is correct (if needed)
- [ ] Implementation guidance provided
- [ ] Next steps are clear

## Anti-patterns to Avoid

❌ Creating removal scripts (use add-removal-script instead)
❌ Adding scripts without implementation guidance
❌ Forgetting to mention TODO sections to user
❌ Not providing example code patterns
❌ Skipping the "implement your logic" reminder

## Success Criteria

User should have:
✅ Working enhancement script template
✅ Script registered in site config
✅ Clear understanding of what to implement
✅ Example code for their enhancement type
✅ Knowledge of how to test and debug

---

**Remember**: Enhancement scripts need custom implementation - always remind user to fill in TODO sections!
