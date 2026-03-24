# Quick Start Guide

Get the Web Debloater extension running in 5 minutes!

## ⚡ Fast Setup (Testing Without GitHub)

For immediate testing without setting up GitHub:

```bash
# 1. Install dependencies
npm install

# 2. Build extension
npm run build

# 3. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the `dist/` folder

# 4. Open options page
# - Click "Extension options" on the extension card
# - You'll see a "GitHub repository not configured" error - this is expected
```

**Note**: The extension uses Chrome's default icon. To add custom icons, see SETUP.md. Without GitHub configuration, the extension **will work** with bundled fallback scripts, but auto-updates won't function.

## 🚀 Full Setup (With Auto-Updates)

### 1. Create GitHub Repository

```bash
cd github-repo
git init
git add .
git commit -m "Initial zone scripts"

# Create a new public repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Configure Extension

Edit `config/zones.ts`:

```typescript
export const GITHUB_REPO_CONFIG = {
  owner: 'YOUR_GITHUB_USERNAME',     // ← Change this
  repo: 'YOUR_REPO_NAME',            // ← Change this
  branch: 'main',
  // ...
};
```

### 3. Rebuild and Test

```bash
npm run build

# Reload extension in chrome://extensions/
# Click "Check for Updates" in options page
# Should now connect successfully to your GitHub repo
```

## 🧪 Test the Extension

### YouTube (works on all *.youtube.com pages)
1. Visit https://www.youtube.com/ (or any YouTube page)
2. Open DevTools Console (F12)
3. Look for `[YouTube Debloater]` messages
4. If "Reels Removal" is enabled, you should see reels/shorts removed
5. Navigate to subscriptions, search, etc. - the script runs on all YouTube pages

### GitHub (works on all *.github.com pages)
1. Visit any GitHub page (e.g., https://github.com/microsoft/vscode)
2. Scroll down - enabled zones inject on all GitHub pages
3. Open DevTools Console
4. Look for `[GitHub Enhancer]` messages

**Note**: All zones for a site now run on ALL pages of that site. Scripts handle page-specific logic internally (e.g., reels removal checks if current page is home/search/subscriptions).

## 📝 Next Steps

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 🐛 Common Issues

**"GitHub repository not configured"**
- Update `config/zones.ts` with your repo details
- Run `npm run build` again

**Scripts not running**
- Check browser console for errors
- Verify zones are enabled in options page
- Try reloading the page

**Build errors**
```bash
rm -rf node_modules
npm install
npm run build
```
