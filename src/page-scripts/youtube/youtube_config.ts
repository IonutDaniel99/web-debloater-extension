import { SiteConfig } from "../scripts";

/**
 * YOUTUBE CONFIG
 */
export const YOUTUBE_CONFIG: SiteConfig = {
  id: "youtube",
  name: "YouTube",
  urlPatternBase: "youtube\\..*",
  defaultScripts: [
    {
      id: "hideShortsButton",
      name: "Hide Shorts Button",
      description: 'Remove the "Shorts" button from YouTube navigation',
      scriptPath: "youtube/remove/shorts/hideShortsButton.js",
      defaultEnabled: false,
      type: "removal",
    },
  ],
  pathScripts: [
    {
      id: "hideShortsHome",
      name: "Hide Shorts Shelf (Home)",
      description: "Remove Shorts shelf from YouTube home page",
      scriptPath: "youtube/remove/shorts/hideShortsHome.js",
      urlPattern: "youtube\.com/?(?:\\?.*)?$",
      type: "removal",
      defaultEnabled: false,
    },
    {
      id: "hideShortsSubscriptions",
      name: "Hide Shorts Shelf (Subscriptions)",
      description: "Remove shorts shelves from subscriptions pages",
      scriptPath: "youtube/remove/shorts/hideShortsSubscriptions.js",
      urlPattern: "youtube\\..*/feed/.*",
      type: "removal",
      defaultEnabled: false,
    },
  ],
};