/**
 * GitHub Fetcher
 * 
 * Handles fetching zone scripts and version information from GitHub repository.
 * Uses raw.githubusercontent.com for direct file access.
 */

import { GITHUB_REPO_CONFIG } from '@config/zones';
import type { ZoneVersions } from './storage-manager';

export interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class GitHubFetcher {
  /**
   * Fetch versions.json from GitHub repository
   */
  static async fetchVersions(): Promise<FetchResult<ZoneVersions>> {
    try {
      const url = GITHUB_REPO_CONFIG.getVersionsUrl();
      const response = await fetch(url, {
        cache: 'no-cache',
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data as ZoneVersions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch a specific zone script from GitHub
   */
  static async fetchScript(scriptPath: string): Promise<FetchResult<string>> {
    try {
      const url = GITHUB_REPO_CONFIG.getScriptUrl(scriptPath);
      const response = await fetch(url, {
        cache: 'no-cache',
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const scriptContent = await response.text();
      return {
        success: true,
        data: scriptContent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch multiple scripts in parallel
   */
  static async fetchScripts(scriptPaths: string[]): Promise<Map<string, FetchResult<string>>> {
    const results = new Map<string, FetchResult<string>>();
    
    const promises = scriptPaths.map(async (path) => {
      const result = await this.fetchScript(path);
      results.set(path, result);
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Test connection to GitHub repository
   */
  static async testConnection(): Promise<FetchResult<boolean>> {
    try {
      const result = await this.fetchVersions();
      if (result.success) {
        return { success: true, data: true };
      }
      return {
        success: false,
        error: result.error || 'Failed to fetch versions',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if the GitHub repo configuration is valid
   */
  static isConfigured(): boolean {
    return (
      GITHUB_REPO_CONFIG.owner !== 'YOUR_USERNAME' &&
      GITHUB_REPO_CONFIG.repo !== 'YOUR_REPO_NAME'
    );
  }
}
