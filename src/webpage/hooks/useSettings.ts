import { useState, useEffect } from 'react';
import type { ZoneSettings, ZoneVersions } from '@core/storage-manager';
import { toast } from 'sonner';

type UpdateCheckResult = {
  success: boolean;
  needsUpdate: boolean;
  localVersion?: string;
  remoteVersion?: string;
};

// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

export function useSettings() {
  const [settings, setSettings] = useState<ZoneSettings>({});
  const [versions, setVersions] = useState<ZoneVersions>({});
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [pendingChanges, setPendingChanges] = useState<ZoneSettings>({});

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isExtension) {
      return;
    }

    const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_INFO' });
    if (response.success) {
      setSettings(response.data.settings || {});
      setVersions(response.data.versions || {});
      setLastCheck(response.data.lastCheck || 0);
    }
  };

  /**
   * Handle setting change
   * Supports both formats:
   * - Legacy: handleSettingChange('youtube', 'shorts', 'enabled', false)
   * - Data-driven: handleSettingChange('youtube/hideShortsButton', 'enabled', 'enabled', true)
   */
  const handleSettingChange = (
    siteIdOrKey: string,
    zoneIdOrKey: string,
    keyOrValue: string | boolean | number,
    valueOrUndefined?: boolean | string | number
  ) => {
    let siteId: string;
    let zoneId: string;
    let key: string;
    let value: boolean | string | number;

    // Check if first param contains "/" (data-driven flat key format)
    if (siteIdOrKey.includes('/')) {
      // Data-driven format: handleSettingChange('youtube/hideShortsButton', 'enabled', 'enabled', true)
      const flatKey = siteIdOrKey;
      siteId = flatKey; // Use as-is for flat storage
      zoneId = zoneIdOrKey; // This is the actual key (e.g., 'enabled')
      key = zoneIdOrKey;
      value = keyOrValue as boolean | string | number;
    } else {
      // Legacy format: handleSettingChange('youtube', 'shorts', 'enabled', false)
      siteId = siteIdOrKey;
      zoneId = zoneIdOrKey;
      key = keyOrValue as string;
      value = valueOrUndefined!;
    }

    // Store in pending changes (don't save to storage yet)
    const newPending = { ...pendingChanges };
    if (!newPending[siteId]) newPending[siteId] = {};
    if (!newPending[siteId][zoneId]) newPending[siteId][zoneId] = {};
    newPending[siteId][zoneId][key] = value;
    setPendingChanges(newPending);
  };

  const handleApplyChanges = async (siteId: string, siteName: string) => {
    if (!isExtension || !pendingChanges[siteId]) return;

    // Save all pending changes for this site
    for (const [zoneId, zoneSettings] of Object.entries(pendingChanges[siteId])) {
      for (const [key, value] of Object.entries(zoneSettings)) {
        await chrome.runtime.sendMessage({
          type: 'UPDATE_SETTING',
          siteId,
          zoneId,
          key,
          value,
        });
      }
    }

    // Update local settings state
    const newSettings = { ...settings };
    if (!newSettings[siteId]) newSettings[siteId] = {};
    newSettings[siteId] = {
      ...newSettings[siteId],
      ...pendingChanges[siteId],
    };
    setSettings(newSettings);

    // Clear pending changes for this site
    const newPending = { ...pendingChanges };
    delete newPending[siteId];
    setPendingChanges(newPending);

    // Notify user and refresh tabs
    await chrome.runtime.sendMessage({ 
      type: 'SETTINGS_CHANGED',
      siteId 
    });
    toast.success(`${siteName} settings applied!`);
  };

  const handleCheckUpdates = async () => {
    if (!isExtension) return;

    setIsChecking(true);
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_UPDATES' });
    if (response.success) {
      setUpdateInfo(response.data);
      await loadData();
      if (response.data.needsUpdate) {
        toast.info('Selector update available!');
      } else {
        toast.success('Selectors are up to date!');
      }
    } else {
      toast.error('Failed to check for updates');
    }
    setIsChecking(false);
  };

  const handleApplyUpdates = async () => {
    if (!isExtension || !updateInfo || !updateInfo.needsUpdate) return;

    setIsChecking(true);
    const response = await chrome.runtime.sendMessage({
      type: 'APPLY_UPDATES',
    });
    if (response.success) {
      await loadData();
      setUpdateInfo(null);
      toast.success('Updates applied successfully!');
    } else {
      toast.error('Failed to apply updates');
    }
    setIsChecking(false);
  };

  /**
   * Get current setting value
   * Supports both formats:
   * - Legacy: getCurrentSetting('youtube', 'shorts', 'enabled', false)
   * - Data-driven: getCurrentSetting('youtube/hideShortsButton', 'enabled',  'enabled', true)
   */
  const getCurrentSetting = (siteIdOrKey: string, scriptIdOrKey: string, key: string, defaultValue?: any) => {
    // Check if first param contains "/" (data-driven flat key format)
    if (siteIdOrKey.includes('/')) {
      const flatKey = siteIdOrKey;
      // For flat keys, the second param is the actual key, third is default value
      const actualKey = scriptIdOrKey;
      const actualDefault = key;
      
      // Try flat structure first (data-driven scripts)
      if (pendingChanges[flatKey]?.[actualKey] !== undefined) {
        return pendingChanges[flatKey][actualKey];
      }
      if (settings[flatKey]?.[actualKey] !== undefined) {
        return settings[flatKey][actualKey];
      }
      return actualDefault;
    }
    
    // Legacy nested format
    const siteId = siteIdOrKey;
    const scriptId = scriptIdOrKey;
    return pendingChanges[siteId]?.[scriptId]?.[key] 
      ?? settings[siteId]?.[scriptId]?.[key] 
      ?? defaultValue;
  };

  const hasPendingChanges = (siteId: string) => {
    return !!pendingChanges[siteId] && Object.keys(pendingChanges[siteId]).length > 0;
  };

  return {
    settings,
    versions,
    lastCheck,
    isChecking,
    updateInfo,
    pendingChanges,
    handleSettingChange,
    handleApplyChanges,
    handleCheckUpdates,
    handleApplyUpdates,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  };
}
