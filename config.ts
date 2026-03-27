/**
 * Central Configuration
 */

// GitHub Repository URL
export const REMOTE_CONFIG_URL = 
  'https://raw.githubusercontent.com/IonutDaniel99/web-debloater-extension/master/config/scripts-config.json';

// Auto-update interval (hours)
export const AUTO_UPDATE_INTERVAL_HOURS = 6;

// Chrome Storage Keys
export const STORAGE_KEYS = {
  REMOTE_CONFIG: 'remote_scripts_config',
  REMOTE_CONFIG_VERSION: 'remote_scripts_config_version',
} as const;

// Chrome Alarm Names
export const ALARMS = {
  REMOTE_CONFIG_UPDATE: 'REMOTE_CONFIG_ALARM',
} as const;
