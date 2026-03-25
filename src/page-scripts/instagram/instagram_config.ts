import { SiteConfig } from "../scripts";

/**
 * INSTAGRAM CONFIG
 */
export const INSTAGRAM_CONFIG: SiteConfig = {
  id: "instagram",
  name: "Instagram",
  urlPatternBase: "instagram\\..*",
  defaultScripts: [],
  pathScripts: [
    {
      id: "hideProfileContainerHome",
      name: "Hide Profile Container (Home)",
      description: "Remove profile container from Instagram home page",
      scriptPath: "instagram/remove/home/hideProfileContainerHome.js",
      urlPattern: "instagram\.com/?(?:\\?.*)?$",
      type: "removal",
      defaultEnabled: false,
    },
  ],
};
