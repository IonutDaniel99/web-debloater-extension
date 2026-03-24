# Setup Guide

Follow these steps to get the Web Debloater extension up and running.

## Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account (for hosting zone scripts)
- Chromium-based browser (Chrome, Edge, Brave, etc.)

## Step 1: Install Dependencies

```bash
cd /home/obsidian/D/Projects/web-debloater-extension
npm install
```

## Step 2: Create GitHub Repository for Scripts

1. Create a new **public** GitHub repository (e.g., `web-debloater-scripts`)
2. Upload the contents of `github-repo/` to the repository:
   ```bash
   cd github-repo
   git init
   git add .
   git commit -m "Initial zone scripts"
   git remote add origin https://github.com/YOUR_USERNAME/web-debloater-scripts.git
   git push -u origin main
   ```

## Step 3: Configure Extension

Edit `config/zones.ts` and update the GitHub repository configuration:

```typescript
export const GITHUB_REPO_CONFIG = {
  owner: 'YOUR_GITHUB_USERNAME',  // Replace with your GitHub username
  repo: 'web-debloater-scripts',  // Replace with your repo name
  branch: 'main',
  // ...
};
```

## Step 4: Create Extension Icons (Optional)

Icons are **optional** for development. The extension will work fine with Chrome's default icon.

### Option A: Skip Icons (Recommended for Testing)

The manifest is already configured without icons. You can skip this step entirely.

### Option B: Add Custom Icons (For Production)

If you want custom branding:

1. Design your icon (recommended: 128x128px base)
2. Export as PNG at three sizes:
   - 16x16 → `public/icons/icon16.png`
   - 48x48 → `public/icons/icon48.png`
   - 128x128 → `public/icons/icon128.png`
3. Update `public/manifest.json` to include the icons section:
   ```json
   "icons": {
     "16": "icons/icon16.png",
     "48": "icons/icon48.png",
     "128": "icons/icon128.png"
   }
   ```
4. Rebuild: `npm run build`

Tools:
- [Figma](https://figma.com) - Free design tool
- [GIMP](https://www.gimp.org/) - Free image editor
- [Favicon Generator](https://www.favicon-generator.org/) - Quick PNG generation

## Step 5: Build the Extension

### Development Build (with live reload)

```bash
npm run dev
```

Then load the extension:
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder

**Note**: With `npm run dev`, you can modify options page code and it will hot-reload. TypeScript modules will require rebuild.

### Production Build

```bash
npm run build
```

## Step 6: Test the Extension

1. **Load extension** in Chrome (see Step 5)
2. **Check service worker**:
   - Go to `chrome://extensions/`
   - Find "Web Debloater"
   - Click "service worker" link to open DevTools
   - Check for errors in console
3. **Open options page**:
   - Click "Extension options" button
   - Verify YouTube and GitHub sites appear
   - Try toggling zone settings
4. **Test on YouTube**:
   - Visit `https://www.youtube.com/`
   - Check if Reels are hidden (if enabled in settings)
   - Open DevTools Console, look for `[YouTube Debloater]` logs
5. **Test on GitHub**:
   - Visit any GitHub PR page (e.g., `https://github.com/microsoft/vscode/pulls`)
   - Scroll down - "Go to Top" button should appear
   - Open DevTools Console, look for `[GitHub Enhancer]` logs
6. **Test updates**:
   - Click "Check for Updates" in options page
   - If configured correctly, it should fetch `versions.json` from your GitHub repo

## Step 7: Manual Update Check

To test the update system:

1. Modify a zone script in your GitHub repo (e.g., `scripts/youtube/reels.js`)
2. Update the version in `versions.json`:
   ```json
   {
     "youtube": {
       "reels": "1.0.1",  // Changed from 1.0.0
       ...
     }
   }
   ```
3. Commit and push to GitHub
4. In extension options page, click "Check for Updates"
5. You should see an update notification
6. Click "Apply Updates"
7. The new script will be downloaded and used

## Troubleshooting

### "GitHub repository not configured" error

- Check that you updated `config/zones.ts` with your actual GitHub username and repo name
- Make sure you rebuild: `npm run build`

### Scripts not injecting

- Check browser console for errors
- Verify URL patterns in `config/zones.ts` match the pages you're visiting
- Check that zones are enabled in options page
- Verify `chrome.scripting` permission in manifest

### Options page won't open

- Check for TypeScript errors: `npm run type-check`
- Look at service worker console for errors
- Verify `options_page` path in manifest.json

### Updates not downloading

- Verify GitHub repo is public (not private)
- Verify `versions.json` is at the root of the repo
- Check network tab in service worker DevTools during update check
- Verify `raw.githubusercontent.com` is accessible

### Build errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check without building
npm run type-check
```

## Next Steps

### Adding More Zones

See README.md section "Adding a New Zone"

### Publishing to Chrome Web Store

1. Create a ZIP of the `dist/` folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay one-time $5 developer fee if first time
4. Upload ZIP and fill in store listing details
5. Submit for review

### Advanced Configuration

- Modify zone URL patterns in `config/zones.ts`
- Add new settings to zones (boolean, select, number types supported)
- Create custom zone scripts with more advanced DOM manipulation
- Adjust update check interval (currently 24 hours in `service-worker.ts`)

## Development Tips

- **Hot Module Replacement**: Run `npm run dev` and changes to React components reload instantly
- **Console Logging**: Zone scripts log to the page console, core modules log to service worker console
- **Storage Inspection**: Use DevTools > Application > Storage > chrome.storage to inspect stored data
- **Alarm Debugging**: In service worker console, run `chrome.alarms.getAll().then(console.log)` to check update alarms

## Support

- Check the main [README.md](README.md) for architecture details
- Review `config/zones.ts` for zone configuration examples
- Examine existing zone scripts in `src/content-scripts/` for patterns
