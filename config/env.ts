/**
 * Environment Configuration
 * 
 * Centralized access to environment variables from .env file
 * Vite automatically loads .env and exposes VITE_* variables via import.meta.env
 */

export const ENV = {
  /**
   * URL for remote selectors.json file
   */
  SELECTORS_URL: import.meta.env.VITE_SELECTORS_URL || 'https://example.com/selectors.json',

  /**
   * Update check interval in hours
   */
  UPDATE_INTERVAL_HOURS: Number(import.meta.env.VITE_UPDATE_INTERVAL_HOURS) || 24,

  /**
   * Alarm name for periodic updates
   */
  ALARM_NAME: import.meta.env.VITE_ALARM_NAME || 'selector-update-check',
} as const;
