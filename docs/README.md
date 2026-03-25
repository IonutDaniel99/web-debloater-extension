# Web Debloater Extension - Documentation

Welcome to the Web Debloater Extension documentation! This folder contains guides for extending and customizing the extension.

## 📚 Available Guides

### For Developers

- **[Adding Content Removal Scripts](./add-remove-content-for-page.md)**  
  Learn how to remove unwanted elements from websites (ads, recommendations, clutter)
  
- **[Adding Enhancement Scripts](./add-enhancement-for-page.md)**  
  Learn how to add new features and functionality to websites

## 🚀 Quick Start

1. **Choose what you want to do:**
   - Remove something annoying? → [Content Removal Guide](./add-remove-content-for-page.md)
   - Add a useful feature? → [Enhancement Guide](./add-enhancement-for-page.md)

2. **Follow the step-by-step guide:**
   - Each guide includes complete code examples
   - Copy, paste, and customize for your needs
   - Build and test using `npm run build`

3. **Test your changes:**
   - Load the extension from `dist/` folder
   - Verify your script works
   - Toggle it on/off in settings

## 📁 Project Structure

```
web-debloater-extension/
├── config/
│   ├── scripts.ts          # Register all scripts here
│   └── selectors.json      # CSS selectors for removal scripts
├── src/
│   ├── content-scripts/    # Your scripts go here
│   │   ├── youtube/
│   │   │   ├── remove/    # Removal scripts
│   │   │   └── add/       # Enhancement scripts
│   │   └── github/
│   │       ├── remove/
│   │       └── add/
│   ├── core/              # Shared utilities
│   │   └── dom-utils.ts   # Helper functions
│   └── webpage/           # Settings UI
└── docs/                  # You are here!
```

## 🛠️ Development Workflow

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev

# Load extension in browser
# Chrome: chrome://extensions/ → Load unpacked → select dist/
# Firefox: about:debugging → Load Temporary Add-on → select dist/manifest.json
```

## 💡 Tips

- **Start simple** - Copy an existing script and modify it
- **Use DevTools** - Inspect elements to find selectors (F12)
- **Check console** - Look for your `console.log()` messages
- **Test thoroughly** - Toggle scripts on/off, test on different pages
- **Follow patterns** - See existing scripts in `src/content-scripts/`

## 🤝 Contributing

When adding new scripts:
1. Follow the guides in this folder
2. Use meaningful names and descriptions
3. Add comments explaining your code
4. Test on multiple pages
5. Consider edge cases (dynamic content, dark mode, etc.)

## 📖 Further Reading

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Mutation Observer API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

## ❓ Need Help?

- Check existing scripts in `src/content-scripts/` for examples
- Look at `core/dom-utils.ts` for available helper functions
- Read the inline comments in the codebase
- Open an issue if you find problems

---

Happy coding! 🎉
