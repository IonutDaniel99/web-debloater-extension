import { SiteConfig } from "../scripts";

/**
 * GITHUB CONFIG
 */
export const GITHUB_CONFIG: SiteConfig = {
  id: "github",
  name: "GitHub",
  urlPatternBase: "github\\.com",
  defaultScripts: [
    {
      id: "goToTop",
      name: "Go to Top Button",
      description: 'Add floating "Go to Top" button on all GitHub pages',
      scriptPath: "github/add/goToTopButton.js",
      defaultEnabled: false,
      type: "enhancement",
    },
  ],
  pathScripts: [],
};