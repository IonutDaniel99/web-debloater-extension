/**
 * Sites Configuration
 *
 * Defines sites, URL patterns, and scripts to inject.
 * Scripts are only injected if enabled in global settings.
 */

import { GITHUB_CONFIG } from "./github/github_config";
import { INSTAGRAM_CONFIG } from "./instagram/instagram_config";
import { YOUTUBE_CONFIG } from "./youtube/youtube_config";

export interface ScriptConfig {
  id: string; // Unique script ID (used in settings)
  name: string; // Display name
  description: string; // What the script does
  scriptPath: string; // Path relative to page-scripts/
  defaultEnabled: false; // Default enabled state
  type: "enhancement" | "removal"; // Type of script (for UI categorization)
}

export interface PathScript extends ScriptConfig {
  urlPattern: string; // URL pattern regex for this specific path
}

export interface SiteConfig {
  id: string; // Site ID (e.g., "youtube")
  name: string; // Display name
  urlPatternBase: string; // Base URL pattern regex (e.g., "youtube\\..*")
  defaultScripts: ScriptConfig[]; // Scripts to run on all pages of this site
  pathScripts: PathScript[]; // Scripts to run on specific paths
}

/**
 * Exported Configuration Array
 *
 * Order matters for UI display and script injection priority.
 */
export const SCRIPTS_CONFIG: SiteConfig[] = [
  YOUTUBE_CONFIG,
  GITHUB_CONFIG,
  INSTAGRAM_CONFIG,
];
