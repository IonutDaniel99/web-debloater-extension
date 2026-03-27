# Data-Driven Architecture Design

## Problem Statement

Current challenges:
- Extension size grows with each new script (~380KB currently, but will increase)
- Every new feature requires Chrome Web Store review and approval
- Hard-coded UI components for each site/feature
- Selectors already update dynamically, but script logic is static

## Chrome Web Store Constraint

**Critical**: Chrome extensions **cannot execute remotely hosted code**. All JavaScript logic must be bundled with the extension.

### What's Allowed ✅
- Downloading **configuration JSON** from remote sources
- Updating **selectors, settings, metadata** dynamically
- Loading **data** that parameterizes existing code

### What's Prohibited 🚫
- Downloading JavaScript code strings and executing them
- Using `eval()` or `new Function()` on remote content
- Dynamic script injection from external sources

## Proposed Solution: Hybrid Data-Driven Architecture

### Core Principle
**Static code, dynamic configuration**

Keep reusable script "engines" in the extension, but make them configurable via remote JSON.

---

## Architecture Design

### 1. Generic Script Engines (Bundled in Extension)

Instead of specific scripts, bundle generic engines:

```typescript
// src/engines/removal-engine.ts
export interface RemovalConfig {
  id: string;
  name: string;
  description: string;
  selectors: SelectorInput;
  waitFor?: string; // Wait for element before running
  observeChanges?: boolean; // Use MutationObserver
  conditions?: {
    urlPattern?: string;
    customCheck?: string; // Function name in window scope
  };
}

export function executeRemoval(config: RemovalConfig) {
  window.onload(() => {
    const { hideElement, waitForElement } = window.__dom_utils__;
    
    if (config.waitFor) {
      waitForElement(config.waitFor).then(() => {
        hideElement(config.selectors, config.observeChanges);
      });
    } else {
      hideElement(config.selectors, config.observeChanges);
    }
  });
}
```

```typescript
// src/engines/enhancement-engine.ts
export interface EnhancementConfig {
  id: string;
  name: string;
  description: string;
  type: 'button' | 'shortcut' | 'ui-modification' | 'feature';
  button?: {
    text: string;
    icon?: string;
    position: { selector: string; placement: 'before' | 'after' | 'inside' };
    onClick: string; // Function name in global actions registry
  };
  shortcut?: {
    keys: string;
    action: string; // Function name
  };
}

export function executeEnhancement(config: EnhancementConfig) {
  if (config.button) {
    createButton(config.button);
  }
  if (config.shortcut) {
    registerShortcut(config.shortcut);
  }
}
```

### 2. Remote Configuration Structure

Store on GitHub as JSON (can be updated without extension approval):

```json
{
  "version": "2026.3.27.1000",
  "lastUpdated": "2026-03-27T10:00:00Z",
  "sites": {
    "youtube": {
      "scripts": {
        "hideShorts": {
          "type": "removal",
          "id": "hideShorts",
          "name": "Hide Shorts",
          "description": "Removes YouTube Shorts from homepage",
          "defaultEnabled": false,
          "config": {
            "selectors": ["ytd-rich-shelf-renderer[is-shorts]"],
            "observeChanges": true,
            "conditions": {
              "urlPattern": "youtube\\.com/?$"
            }
          }
        },
        "goToTop": {
          "type": "enhancement",
          "id": "goToTop",
          "name": "Go to Top Button",
          "description": "Adds button to scroll to top",
          "defaultEnabled": true,
          "config": {
            "type": "button",
            "button": {
              "text": "↑ Top",
              "position": {
                "selector": "body",
                "placement": "inside"
              },
              "onClick": "scrollToTop"
            }
          }
        }
      }
    },
    "github": {
      "scripts": { ... }
    }
  },
  "actions": {
    "scrollToTop": {
      "code": "window.scrollTo({ top: 0, behavior: 'smooth' });"
    }
  }
}
```

**Wait, actions.code would violate the policy!** We need predefined actions:

```json
{
  "actions": {
    "scrollToTop": "predefined.scrollToTop",
    "copyToClipboard": "predefined.copyToClipboard",
    "downloadContent": "predefined.downloadContent"
  }
}
```

```typescript
// src/engines/predefined-actions.ts - Bundled with extension
export const PREDEFINED_ACTIONS = {
  scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  scrollToBottom: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
  copyToClipboard: (text: string) => navigator.clipboard.writeText(text),
  downloadContent: (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  },
  // ... more predefined actions
};
```

### 3. Dynamic UI Rendering

Read the configuration to generate UI automatically:

```typescript
// src/webpage/pages/DynamicSitePage.tsx
interface DynamicSitePageProps {
  siteId: string;
}

export function DynamicSitePage({ siteId }: DynamicSitePageProps) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [settings, setSettings] = useSettings();
  
  useEffect(() => {
    // Load site config from remote/cached data
    loadSiteConfig(siteId).then(setSiteConfig);
  }, [siteId]);
  
  if (!siteConfig) return <LoadingSpinner />;
  
  const removalScripts = Object.values(siteConfig.scripts)
    .filter(s => s.type === 'removal');
  const enhancementScripts = Object.values(siteConfig.scripts)
    .filter(s => s.type === 'enhancement');
  
  return (
    <div>
      <h1>{siteConfig.name}</h1>
      
      <h2>Content Removal</h2>
      {removalScripts.map(script => (
        <ScriptToggle
          key={script.id}
          script={script}
          enabled={settings[script.id]}
          onToggle={(enabled) => updateSetting(script.id, enabled)}
        />
      ))}
      
      <h2>Enhancements</h2>
      {enhancementScripts.map(script => (
        <ScriptToggle
          key={script.id}
          script={script}
          enabled={settings[script.id]}
          onToggle={(enabled) => updateSetting(script.id, enabled)}
        />
      ))}
    </div>
  );
}
```

### 4. Script Execution Flow

```typescript
// src/core/script-injector.ts
export class ScriptInjector {
  static async injectForTab(tabId: number, url: string): Promise<void> {
    // 1. Load remote configuration (cached locally)
    const config = await loadRemoteConfig();
    
    // 2. Find matching site
    const site = findSiteForURL(url, config);
    if (!site) return;
    
    // 3. Get enabled scripts from user settings
    const settings = await StorageManager.getSettings();
    
    // 4. Filter enabled scripts
    const enabledScripts = Object.values(site.scripts)
      .filter(script => settings[script.id] === true);
    
    // 5. Inject appropriate engine for each script
    for (const script of enabledScripts) {
      if (script.type === 'removal') {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: executeRemoval,
          args: [script.config],
          world: 'MAIN',
        });
      } else if (script.type === 'enhancement') {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: executeEnhancement,
          args: [script.config],
          world: 'MAIN',
        });
      }
    }
  }
}
```

---

## Benefits

### ✅ Chrome Store Compliant
- All executable code is bundled with the extension
- Only configuration data is fetched remotely

### ✅ Smaller Extension Size
- Generic engines are reused for all sites/features
- No duplicate code for similar functionality
- Source maps excluded from production

### ✅ Faster Updates
- Add new sites/scripts by updating JSON
- No Chrome Store review needed for new features
- Users get updates instantly via check-for-updates button

### ✅ Dynamic UI
- No need to create page components for each site
- UI automatically adapts to available scripts
- Easier to maintain

### ✅ Easier Development
- Add new removal: just add config entry
- Add new enhancement: create config + predefined action (if needed)
- No need to create new files for simple scripts

---

## Limitations

### ⚠️ Constrained Functionality
- Can only do what the predefined engines support
- Complex custom logic requires extension update
- Can't execute arbitrary JavaScript from remote

### 💡 Mitigation Strategy
1. **Rich engine library**: Create comprehensive set of engines covering most use cases
   - Removal engine (hide elements)
   - Button enhancement engine
   - Shortcut engine
   - Content replacement engine
   - UI modification engine (colors, styles)
   - Redirect engine
   
2. **Predefined actions library**: Bundle common actions
   - Navigation (scroll, click, redirect)
   - Data operations (copy, download, export)
   - UI modifications (toggle theme, resize, reposition)
   
3. **Composable configs**: Allow combining multiple engines
   ```json
   {
     "id": "enhancedVideoPlayer",
     "name": "Enhanced Video Player",
     "engines": [
       {
         "type": "removal",
         "config": { "selectors": [".ad-overlay"] }
       },
       {
         "type": "enhancement",
         "config": { "type": "shortcut", "keys": "space", "action": "playPause" }
       }
     ]
   }
   ```

4. **Escape hatch**: For truly custom scripts, still support bundled scripts
   - Keep the current system for edge cases
   - Most features use data-driven approach
   - Complex features use traditional bundled scripts

---

## Migration Path

### Phase 1: Infrastructure (Week 1)
1. ✅ Disable source maps in production (DONE)
2. Create generic engines (removal, enhancement)
3. Create remote config JSON schema
4. Update config loader to support remote configs

### Phase 2: Migrate Existing Scripts (Week 2)
1. Convert simple removal scripts to configs
   - hideShorts → config entry
   - hideProfileContainer → config entry
2. Convert simple enhancements to configs
   - goToTopButton → config + predefined action

### Phase 3: Dynamic UI (Week 3)
1. Create DynamicSitePage component
2. Update router to use dynamic pages
3. Remove hard-coded page components (youtube.tsx, github.tsx, etc.)

### Phase 4: Testing & Optimization (Week 4)
1. Test all migrated scripts
2. Measure size reduction
3. Test update mechanism
4. Documentation

### Phase 5: Advanced Features (Future)
1. More engine types
2. Larger predefined actions library
3. Composable configurations
4. Analytics/telemetry for popular scripts

---

## Expected Results

### Size Reduction
- **Current**: ~380KB (without source maps)
- **After migration**: ~200-250KB estimated
  - Generic engines: ~50KB
  - Predefined actions: ~30KB
  - UI components: ~120KB (reduced from current 299KB)
  - Service worker: ~12KB
  
### Update Frequency
- **Current**: 1-2 weeks (Chrome Store review)
- **After**: Instant (update config JSON)

### Development Speed
- **Current**: Create 3-5 files per new script
- **After**: Add 1 JSON config entry (for simple scripts)

---

## Alternative: Personal Use Edition

If you want the **full remote code execution** approach (NOT for Chrome Store):

### Architecture
1. Extension downloads script definitions including code strings
2. Uses dynamic import or eval to execute
3. Complete flexibility

### Distribution
- Self-hosted or direct `.crx` installation
- Firefox unlisted add-ons (with proper CSP)
- Enterprise deployment

### Trade-offs
- ✅ Maximum flexibility
- ✅ Smallest possible extension size
- 🚫 Cannot publish to Chrome Web Store
- ⚠️ Security risks
- ⚠️ User trust issues

**Not recommended** unless you have a specific use case that requires it.

---

## Recommendation

**Implement the Hybrid Data-Driven Architecture**

This gives you:
- Chrome Store compliance ✅
- Significant size reduction ✅
- Fast updates for most features ✅
- Flexibility for complex scripts ✅

Start with Phase 1 and incrementally migrate. You can keep the current system working while building the new one in parallel.

---

## Questions to Consider

1. **What percentage of your scripts are "simple" (just selectors)?**
   - If >80%, data-driven is perfect
   - If <50%, might need more predefined engines

2. **How often do you need truly custom logic?**
   - Occasionally: hybrid approach works
   - Frequently: might need richer engine set

3. **Target audience?**
   - Public/Chrome Store: must use data-driven
   - Personal/enterprise: could use remote code execution

4. **Maintenance preference?**
   - Prefer JSON configs: data-driven
   - Prefer TypeScript: keep current system

Let me know which direction you want to pursue!