import { useState, useEffect } from 'react';
import type { ZoneSettings, ZoneVersions } from '@core/storage-manager';
import type { SelectorUpdateCheckResult } from '@core/update-checker';
import { toast } from 'sonner';

// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

export function useSettings() {
  const [settings, setSettings] = useState<ZoneSettings>({});
  const [versions, setVersions] = useState<ZoneVersions>({});
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<SelectorUpdateCheckResult | null>(null);
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

  const handleSettingChange = (
    siteId: string,
    zoneId: string,
    key: string,
    value: boolean | string | number
  ) => {
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
    await chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED' });
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

  const getCurrentSetting = (siteId: string, scriptId: string, key: string, defaultValue: any) => {
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
