# Web Debloater Extension Scripts

This repository contains the auto-updating zone scripts for the Web Debloater Chrome extension.

## Structure

```
scripts/
├── youtube/
│   ├── reels.js        # Remove YouTube Reels/Shorts
│   ├── subscription.js # Subscription feed enhancements
│   └── shared.js       # Common YouTube utilities
├── github/
│   ├── pulls.js        # PR page enhancements
│   └── shared.js       # Common GitHub utilities
└── versions.json       # Version tracking for all zones
```

## versions.json Format

The `versions.json` file tracks versions for each zone using semantic versioning:

```json
{
  "youtube": {
    "reels": "1.0.0",
    "subscription": "1.0.0",
    "shared": "1.0.0"
  },
  "github": {
    "pulls": "1.0.0",
    "shared": "1.0.0"
  }
}
```

## Updating Scripts

1. Modify the zone script file (e.g., `scripts/youtube/reels.js`)
2. Increment the version number in `versions.json`
3. Commit and push changes to the main branch
4. The extension will detect and download updates within 24 hours (or manually via the settings page)

## Script Guidelines

### YouTube Scripts

- Use `window.YouTubeDebloater` utilities from `shared.js`
- Access settings via `window.__ZONE_SETTINGS__`
- Handle YouTube's SPA navigation (watch for URL changes)

### GitHub Scripts

- Use `window.GitHubEnhancer` utilities from `shared.js`
- Access settings via `window.__ZONE_SETTINGS__`
- Handle GitHub's SPA navigation (watch for URL changes)

## Adding New Zones

To add a new zone:

1. Create the script file in the appropriate site folder
2. Add the zone version to `versions.json`
3. Update the extension's `config/zones.ts` to include the new zone
4. Users will get the new zone after updating the extension

## License

MIT
