# Troubleshooting: "No script found for youtube/reels"

## The Problem

You see this error in the console:
```
No script found for youtube/reels
```

This means the script-injector is trying to inject the YouTube reels script, but it's not found in chrome.storage.local.

## Why This Happens

1. **Extension was installed/updated but scripts weren't loaded** into storage
2. **Storage was cleared** manually or by Chrome
3. **Installation failed** before bundled scripts were loaded

## The Fix

### Automatic Fix (Built into v1.0.2+)

The extension now automatically loads bundled scripts on first install via:
- `src/core/bundled-scripts.ts` - Bundles all scripts with the extension
- `UpdateChecker.initializeFallbackScripts()` - Loads scripts into storage

Scripts are loaded when:
- Extension is first installed (`chrome.runtime.onInstalled` with reason: 'install')
- No network connection needed
- Works offline

### Manual Fix (If Still Seeing the Error)

#### Option 1: Reload Extension
```bash
# 1. Rebuild extension
npm run build

# 2. Go to chrome://extensions/
# 3. Click "Reload" button on the extension card
# 4. Open a new YouTube tab
# 5. Check console - error should be gone
```

#### Option 2: Clear Storage and Reinstall
```bash
# 1. Go to chrome://extensions/
# 2. Click "Remove" on the extension
# 3. Rebuild
npm run build

# 4. Click "Load unpacked" and select dist/
# 5. Extension will auto-load bundled scripts
```

#### Option 3: Manually Trigger Script Load

Open the extension's background service worker console:
1. Go to `chrome://extensions/`
2. Click "Service worker (Inactive/Active)" under the extension
3. In the console, run:
```javascript
// Import the module (adjust path if needed)
const { UpdateChecker } = await import('./core/update-checker.js');

// Load bundled scripts
await UpdateChecker.initializeFallbackScripts();

// Verify scripts loaded
const storage = await chrome.storage.local.get('zone_scripts');
console.log('Loaded scripts:', storage.zone_scripts);
```

## Verify the Fix

After applying the fix:

1. **Open YouTube** (any page)
2. **Open DevTools Console** (F12)
3. **Look for success messages**:
   ```
   youtube/reels
   Injected script for youtube/reels
   [YouTube Debloater] Reels removal initialized
   ```

4. **Verify storage** in DevTools:
   - Application tab → Storage → Local Storage → chrome-extension://...
   - Or run in console:
   ```javascript
   chrome.storage.local.get('zone_scripts', (result) => {
     console.log(result.zone_scripts);
   });
   ```

   Should show:
   ```javascript
   {
     youtube: {
       shared: "...(function() { ... })...",
       reels: "...(function() { ... })...",
       subscription: "...(function() { ... })..."
     },
     github: {
       shared: "...(function() { ... })...",
       pulls: "...(function() { ... })..."
     }
   }
   ```

## Prevention

To prevent this error in the future:

1. **Don't clear extension storage manually** unless necessary
2. **Reload extension properly** after rebuilding (use "Reload" button, not remove/re-add)
3. **Wait for installation to complete** before testing
4. **Check service worker console** for initialization logs

## Still Not Working?

Check for these issues:

### Build Issues
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
# Check for errors
npm run build

# Should see:
# ✓ 45 modules transformed.
# ✓ built in XXXms
```

### Missing Files
```bash
# Verify bundled scripts file exists
ls -la src/core/bundled-scripts.ts

# Verify content scripts exist
ls -la src/content-scripts/youtube/
ls -la src/content-scripts/github/
```

### Service Worker Errors
1. Go to `chrome://extensions/`
2. Click "Service worker" under the extension
3. Look for errors during installation
4. Should see: `"Loading bundled scripts..."` and `"Bundled scripts loaded successfully"`

## Technical Details

### How Bundled Scripts Work

1. **Vite `?raw` Import**: 
   ```typescript
   import youtubeReels from '../content-scripts/youtube/reels.js?raw';
   ```
   Imports the file as a plain string (not executed)

2. **Bundled at Build Time**:
   - Scripts are included in `dist/service-worker.js`
   - No separate files needed
   - Works offline

3. **Loaded on Install**:
   ```typescript
   chrome.runtime.onInstalled.addListener(async (details) => {
     if (details.reason === 'install') {
       await UpdateChecker.initializeFallbackScripts();
     }
   });
   ```

4. **Stored in chrome.storage.local**:
   - Key: `zone_scripts`
   - Structure: `{ [site]: { [zone]: scriptContent } }`
   - Persists across browser restarts

### Architecture Change (v1.0.2)

The error is now PREVENTED by:
- ✅ Bundling scripts with extension (no network needed)
- ✅ Auto-loading on first install
- ✅ Site-level URL matching (all zones load for matching sites)
- ✅ Fallback scripts always available

Before v1.0.2:
- ❌ Scripts only fetched from GitHub
- ❌ Required network connection
- ❌ Could fail if GitHub was down/unconfigured
