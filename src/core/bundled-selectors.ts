/**
 * Bundled Selectors
 * 
 * Pre-packaged selectors bundled with the extension.
 * Used as fallback and initial data before remote updates.
 */

import selectorsJson from '../../config/selectors.json?raw';
import type { SelectorsData } from './selector-manager';

export const BUNDLED_SELECTORS: SelectorsData = JSON.parse(selectorsJson);
