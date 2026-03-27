/**
 * Script Types
 *
 * Type definitions for bundled scripts.
 * All script configuration is now loaded from scripts-config.json.
 * 
 * These types are kept for backward compatibility with existing code,
 * but new scripts should be defined in scripts-config.json only.
 */

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
