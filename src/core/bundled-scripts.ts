/**
 * Bundled Scripts Loader
 * 
 * Imports all content scripts from src/content-scripts/.
 * Each script is self-contained with its own utilities.
 */

// YouTube scripts
import hideShortsButton from '../content-scripts/youtube/shorts/hideShortsButton.ts?raw';
import hideShortsHome from '../content-scripts/youtube/shorts/hideShortsHome.ts?raw';
import hideShortsSubscriptions from '../content-scripts/youtube/shorts/hideShortsSubscriptions.ts?raw';

// GitHub scripts
import githubPulls from '../content-scripts/github/pulls.ts?raw';

export const BUNDLED_SCRIPTS: Record<string, Record<string, string>> = {
  youtube: {
    hideShortsButton,
    hideShortsHome,
    hideShortsSubscriptions,
  },
  github: {
    goToTop: githubPulls,
  },
};
