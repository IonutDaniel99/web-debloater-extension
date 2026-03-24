#!/usr/bin/env node

/**
 * Pre-build script to update manifest.json version
 * Generates version format: "Beta-YYYY-MM-DD-HH:MM"
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANIFEST_PATH = resolve(__dirname, '../public/manifest.json');

function generateVersion() {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate(); // 1-31
  const hours = now.getHours(); // 0-23
  const minutes = now.getMinutes(); // 0-59
  
  // Format: YYYY.M.D.HHMM (e.g., 2026.3.24.1423)
  // Last part combines hours and minutes into a single number (0-2359)
  const hour = hours * 100 + minutes;

  
  return `${year}.${month}.${day}.${hour}`;
}

function updateManifestVersion() {
  try {
    // Read manifest
    const manifestContent = readFileSync(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    // Generate new version
    const newVersion = generateVersion();
    const oldVersion = manifest.version;
    
    // Update version
    manifest.version = newVersion;
    
    // Write back with pretty formatting
    writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(manifest, null, 4) + '\n',
      'utf-8'
    );
    
    console.log(`✓ Version updated: ${oldVersion} → ${newVersion}`);
    console.log(`✓ Manifest updated: ${MANIFEST_PATH}`);
    
  } catch (error) {
    console.error('✗ Failed to update version:', error.message);
    process.exit(1);
  }
}

updateManifestVersion();
