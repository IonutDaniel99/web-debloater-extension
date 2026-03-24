/**
 * Bundled Scripts Loader
 * 
 * Imports all content scripts from src/content-scripts/.
 * Each script is self-contained with its own utilities.
 */

// YouTube scripts
import hideReelsButton from '../content-scripts/youtube/reels/hideReelsButton.js?raw';
import hideReelsShelf from '../content-scripts/youtube/reels/hideReelsShelf.js?raw';
import hideShortsLinks from '../content-scripts/youtube/shorts/hideShortsLinks.js?raw';

// GitHub scripts
import githubPulls from '../content-scripts/github/pulls.js?raw';

export const BUNDLED_SCRIPTS: Record<string, Record<string, string>> = {
  youtube: {
    hideReelsButton,
    hideReelsShelf,
    hideShortsLinks,
  },
  github: {
    goToTop: githubPulls,
  },
};
