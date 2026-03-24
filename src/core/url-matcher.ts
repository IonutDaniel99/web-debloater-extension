/**
 * URL Matcher
 * 
 * Matches current URL against zone patterns to determine which zones are active.
 * Uses Chrome's match pattern syntax.
 */

import { SITES_CONFIG, type Zone } from '@config/zones';

export interface ActiveZone {
  site: string;
  zone: Zone;
}

export class URLMatcher {
  /**
   * Convert Chrome match pattern to RegExp
   * Pattern syntax: *://host/path/* where * is wildcard
   */
  static patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except *
    let regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    
    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Test if a URL matches a Chrome match pattern
   */
  static matchesPattern(url: string, pattern: string): boolean {
    try {
      const regex = this.patternToRegex(pattern);
      return regex.test(url);
    } catch (error) {
      console.error(`Invalid pattern: ${pattern}`, error);
      return false;
    }
  }

  /**
   * Get all zones that match the current URL
   * Now matches at site level - all zones for a matching site are returned
   */
  static getMatchingZones(url: string): ActiveZone[] {
    const matches: ActiveZone[] = [];

    for (const site of SITES_CONFIG) {
      if (this.matchesPattern(url, site.urlPattern)) {
        // All zones for this site match
        for (const zone of site.zones) {
          matches.push({ site: site.id, zone });
        }
      }
    }

    return matches;
  }

  /**
   * Check if a specific zone matches a URL
   * Now checks at site level
   */
  static zoneMatchesUrl(siteId: string, zoneId: string, url: string): boolean {
    const site = SITES_CONFIG.find(s => s.id === siteId);
    const zone = site?.zones.find(z => z.id === zoneId);
    
    if (!zone || !site) return false;
    
    return this.matchesPattern(url, site.urlPattern);
  }

  /**
   * Get all unique sites that have matching zones for a URL
   */
  static getMatchingSites(url: string): string[] {
    const matches = this.getMatchingZones(url);
    const uniqueSites = new Set(matches.map(m => m.site));
    return Array.from(uniqueSites);
  }
}
