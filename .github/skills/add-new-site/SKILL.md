---
name: add-new-site
description: 'Add a completely new site to the extension with data-driven scripts. Requires updating scripts-config.json, UI configs, and bundled configs.'
argument-hint: 'Site to add (e.g., "Twitter", "Reddit", "LinkedIn")'
---

# Add New Site

Add a completely new site to the extension with full data-driven support.

## When to Use

✅ **Use for:**
- Adding a new website to the extension
- First script for a site not yet supported

❌ **Use add-script instead for:**
- Adding scripts to existing sites (YouTube, GitHub, Instagram, WhatsApp)

## Overview

Adding a new site requires updating:
1. `config/scripts-config.json` - Site definition + scripts
2. `src/webpage/configs/pages.tsx` - UI route
3. `src/page-scripts/{site}/{site}_config.ts` - Empty bundled config
4. Icons (if needed)

## Procedure

### Step 1: Basic Information

**Q1: Site details**
```
1. Site name? (e.g., "Twitter", "Reddit")
2. Domain? (e.g., "twitter.com", "reddit.com")
3. Site ID? (lowercase, e.g., "twitter", "reddit")
```

**Q2: Initial scripts**
```
Do you want to add scripts now?
1. Yes - Start with removal/enhancement scripts
2. No - Just set up site structure

If Yes, ask for:
- Script type (removal/enhancement)
- Script details (use add-script questions)
```

### Step 2: Add to scripts-config.json

Edit `config/scripts-config.json` and add new site section:

**Minimal Site Entry:**
```json
{
  "sites": {
    "twitter": {
      "name": "Twitter",
      "urlPatternBase": "twitter\\.com",
      "icon": "twitter",
      "scripts": {}
    }
  }
}
```

**With Initial Script:**
```json
{
  "sites": {
    "reddit": {
      "name": "Reddit",
      "urlPatternBase": "reddit\\.com",
      "icon": "reddit",
      "scripts": {
        "hideAds": {
          "id": "hideAds",
          "name": "Hide Sponsored Posts",
          "description": "Removes sponsored posts from Reddit feed",
          "type": "removal",
          "defaultEnabled": false,
          "removal": {
            "selectors": [
              {
                "selector": "[data-promoted-post-id]",
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

### Step 3: Add UI Route

Edit `src/webpage/configs/pages.tsx`:

```typescript
export const PAGES: PagesInterface[] = [
  {
    id: 'home',
    element: <Home />,
    path: '/'
  },
  // ... existing pages ...
  {
    id: 'twitter',  // New site
    element: <DynamicSitePage siteId="twitter" />,
    path: '/site/twitter'
  }
];
```

### Step 4: Create Bundled Config (Empty)

Create `src/page-scripts/{site}/{site}_config.ts`:

```typescript
import { SiteConfig } from "../scripts";

/**
 * {SITE_NAME} CONFIG
 * 
 * All {site} scripts have been migrated to data-driven architecture.
 * See: config/scripts-config.json
 */
export const {SITE_ID}_CONFIG: SiteConfig = {
  id: "{site}",
  name: "{Site Name}",
  urlPatternBase: "{domain}\\\\.com",
  defaultScripts: [],
  pathScripts: [],
};
```

**Example for Twitter:**
```typescript
import { SiteConfig } from "../scripts";

/**
 * TWITTER CONFIG
 * 
 * All Twitter scripts have been migrated to data-driven architecture.
 * See: config/scripts-config.json
 */
export const TWITTER_CONFIG: SiteConfig = {
  id: "twitter",
  name: "Twitter",
  urlPatternBase: "twitter\\.com",
  defaultScripts: [],
  pathScripts: [],
};
```

### Step 5: Update scripts.ts

Edit `src/page-scripts/scripts.ts`:

```typescript
import { GITHUB_CONFIG } from "./github/github_config";
import { INSTAGRAM_CONFIG } from "./instagram/instagram_config";
import { YOUTUBE_CONFIG } from "./youtube/youtube_config";
import { WHATSAPP_CONFIG } from "./whatsapp/whatsapp_config";
import { TWITTER_CONFIG } from "./twitter/twitter_config"; // Add import

export const SCRIPTS_CONFIG: SiteConfig[] = [
  YOUTUBE_CONFIG,
  GITHUB_CONFIG,
  INSTAGRAM_CONFIG,
  WHATSAPP_CONFIG,
  TWITTER_CONFIG, // Add to array
];
```

### Step 6: Add Icon (Optional)

**If using a custom icon:**

1. Add icon component to `src/webpage/components/SiteIcon.tsx`:

```typescript
import {
  Youtube,
  Github,
  Instagram,
  MessageCircle,
  Twitter,  // Add icon import
  Home as HomeIcon,
} from "lucide-react";

// In the switch statement:
case "twitter":
  return <Twitter size={size} className={className} />;
```

**Available lucide-react icons:**
- Twitter
- Linkedin
- Facebook
- MessageSquare (Discord)
- Chrome (Browser)
- Globe (Generic)

### Step 7: Build and Test

```bash
# Build
npm run build

# Reload extension
# chrome://extensions → Reload button

# Test:
# 1. Open extension settings
# 2. New site should appear in sidebar
# 3. Click on site
# 4. Scripts should be listed (if added)
# 5. Navigate to site domain
# 6. Scripts should inject
```

### Step 8: Verify Console

Navigate to the new site and check console:
```
[ScriptInjector] URL: https://twitter.com
[ScriptInjector] ✓ Injected dom-utils.js
[ScriptInjector] ✓ Injected predefined actions
[ScriptInjector] Found X remote scripts for twitter
[ScriptInjector] ✓ Injected data-driven script twitter/scriptId
```

## Complete Example: Adding Reddit

**1. scripts-config.json:**
```json
{
  "sites": {
    "reddit": {
      "name": "Reddit",
      "urlPatternBase": "reddit\\.com",
      "icon": "reddit",
      "scripts": {
        "hideAds": {
          "id": "hideAds",
          "name": "Hide Sponsored Posts",
          "description": "Removes promoted posts from Reddit",
          "type": "removal",
          "defaultEnabled": false,
          "removal": {
            "selectors": [
              {
                "selector": "[data-promoted-post-id]",
                "type": "css"
              },
              {
                "selector": "div[data-testid='post-container']:has([data-click-id='promoted'])",
                "type": "css"
              }
            ],
            "observeChanges": true
          }
        },
        "scrollToTop": {
          "id": "scrollToTop",
          "name": "Scroll to Top Button",
          "description": "Adds floating scroll button",
          "type": "enhancement",
          "defaultEnabled": true,
          "enhancement": {
            "enhancementType": "floating-button",
            "floatingButton": {
              "text": "↑",
              "style": {
                "position": "bottom-right",
                "backgroundColor": "#FF5700",
                "color": "white",
                "size": 50
              },
              "showOnScroll": 300,
              "onClick": "scrollToTop"
            }
          }
        }
      }
    }
  }
}
```

**2. pages.tsx:**
```typescript
{
  id: 'reddit',
  element: <DynamicSitePage siteId="reddit" />,
  path: '/site/reddit'
}
```

**3. reddit_config.ts:**
```typescript
import { SiteConfig } from "../scripts";

export const REDDIT_CONFIG: SiteConfig = {
  id: "reddit",
  "name": "Reddit",
  urlPatternBase: "reddit\\.com",
  defaultScripts: [],
  pathScripts: [],
};
```

**4. scripts.ts:**
```typescript
import { REDDIT_CONFIG } from "./reddit/reddit_config";

export const SCRIPTS_CONFIG: SiteConfig[] = [
  YOUTUBE_CONFIG,
  GITHUB_CONFIG,
  INSTAGRAM_CONFIG,
  WHATSAPP_CONFIG,
  REDDIT_CONFIG,
];
```

**5. SiteIcon.tsx:**
```typescript
case "reddit":
  return <MessageCircle size={size} className={className} />;
```

## Directory Structure

After adding Reddit, structure looks like:
```
src/page-scripts/
├── scripts.ts                    (updated)
├── reddit/                       (new folder)
│   └── reddit_config.ts          (new file)
├── youtube/
│   └── youtube_config.ts
├── github/
│   └── github_config.ts
└── ...

config/
└── scripts-config.json           (updated)

src/webpage/
├── configs/
│   └── pages.tsx                 (updated)
└── components/
    └── SiteIcon.tsx              (updated)
```

## URL Pattern Tips

**Basic domain:**
```
"urlPatternBase": "twitter\\.com"
```

**Subdomain required:**
```
"urlPatternBase": "old\\.reddit\\.com"
```

**Multiple subdomains:**
```
"urlPatternBase": "(www\\.)?twitter\\.com"
```

**Different TLDs:**
```
"urlPatternBase": "twitter\\.(com|co\\.uk|jp)"
```

## Troubleshooting

**Site not appearing in UI?**
- Check pages.tsx syntax
- Verify id matches scripts-config.json
- Rebuild: `npm run build`
- Check console for React errors

**Scripts not injecting?**
- Verify urlPatternBase regex
- Test pattern: `new RegExp("pattern").test(window.location.href)`
- Check console: `[ScriptInjector]` messages
- Ensure scripts-config.json is valid JSON

**Build errors?**
- Check TypeScript syntax in {site}_config.ts
- Verify import paths
- Run: `npm run type-check`

**Icon not showing?**
- Check lucide-react icon name
- Verify import statement
- Ensure case matches in switch statement
- Reload extension

## Notes

- **Bundled config is empty** - All scripts in JSON
- **UI auto-updates** - DynamicSitePage reads from remote config
- **No rebuild for new scripts** - Only rebuild when adding new site
- **Remote updates work** - Once site exists, scripts update via JSON
- **One site config** - First script requires this process, rest use add-script

## Deploy

```bash
# After testing locally:
git add .
git commit -m "Add {Site} support with {X} scripts"
git push origin main

# Users get the update:
# - New site appears in UI after extension update
# - Scripts available immediately
```
