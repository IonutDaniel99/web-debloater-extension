import { useState, useEffect } from 'react';
import type { ZoneSettings, ZoneVersions } from '@core/storage-manager';
import type { SelectorUpdateCheckResult } from '@core/update-checker';
import { SCRIPTS_CONFIG, SiteConfig } from '@config/scripts';

function App() {
  const [settings, setSettings] = useState<ZoneSettings>({});
  const [versions, setVersions] = useState<ZoneVersions>({});
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<SelectorUpdateCheckResult | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_INFO' });
    if (response.success) {
      setSettings(response.data.settings || {});
      setVersions(response.data.versions || {});
      setLastCheck(response.data.lastCheck || 0);
    }
  };

  const handleSettingChange = async (
    siteId: string,
    zoneId: string,
    key: string,
    value: boolean | string | number
  ) => {
    // Optimistically update UI
    const newSettings = { ...settings };
    if (!newSettings[siteId]) newSettings[siteId] = {};
    if (!newSettings[siteId][zoneId]) newSettings[siteId][zoneId] = {};
    newSettings[siteId][zoneId][key] = value;
    setSettings(newSettings);

    // Send to background script (save to storage)
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTING',
      siteId,
      zoneId,
      key,
      value,
    });

    // Mark as having unsaved changes (don't auto-refresh yet)
    setHasUnsavedChanges(true);
  };

  const handleApplySettings = async () => {
    // Refresh all tabs with new settings
    await chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED' });
    setHasUnsavedChanges(false);
  };

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    const response = await chrome.runtime.sendMessage({ type: 'CHECK_UPDATES' });
    if (response.success) {
      setUpdateInfo(response.data);
      await loadData();
    }
    setIsChecking(false);
  };

  const handleApplyUpdates = async () => {
    if (!updateInfo || !updateInfo.needsUpdate) return;

    setIsChecking(true);
    const response = await chrome.runtime.sendMessage({
      type: 'APPLY_UPDATES',
    });
    if (response.success) {
      await loadData();
      setUpdateInfo(null);
    }
    setIsChecking(false);
  };

  const toggleSite = (siteId: string) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
    }
    setExpandedSites(newExpanded);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Web Debloater</h1>
        <p className="text-gray-600">Manage zone-based website modifications</p>
      </div>

      {/* Update Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Updates</h2>
            <p className="text-sm text-gray-600">
              Last checked: {lastCheck ? new Date(lastCheck).toLocaleString() : 'Never'}
            </p>
          </div>
          <button
            onClick={handleCheckUpdates}
            disabled={isChecking}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check for Updates'}
          </button>
        </div>

        {updateInfo && updateInfo.needsUpdate && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  Selector update available
                </p>
                <p className="mt-2 text-sm text-blue-800">
                  Version: {updateInfo.localVersion || 'none'} → {updateInfo.remoteVersion}
                </p>
              </div>
              <button
                onClick={handleApplyUpdates}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Update
              </button>
            </div>
          </div>
        )}

        {updateInfo && !updateInfo.needsUpdate && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-900">Selectors are up to date!</p>
          </div>
        )}

        {updateInfo && !updateInfo.success && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-900">Error: {updateInfo.error}</p>
          </div>
        )}
      </div>

      {/* Apply Changes Section */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-yellow-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  You have unsaved changes
                </p>
                <p className="text-sm text-yellow-700">
                  Click "Apply Changes" to reload all tabs with your new settings
                </p>
              </div>
            </div>
            <button
              onClick={handleApplySettings}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}

      {/* Sites Section */}
      <div className="space-y-4">
        {SCRIPTS_CONFIG.map((site: SiteConfig) => (
          <SiteCard
            key={site.id}
            site={site}
            settings={settings[site.id] || {}}
            versions={versions[site.id] || {}}
            isExpanded={expandedSites.has(site.id)}
            onToggle={() => toggleSite(site.id)}
            onSettingChange={handleSettingChange}
          />
        ))}
      </div>
    </div>
  );
}

interface SiteCardProps {
  site: SiteConfig;
  settings: { [scriptId: string]: { [key: string]: any } };
  versions: { [scriptId: string]: string };
  isExpanded: boolean;
  onToggle: () => void;
  onSettingChange: (siteId: string, scriptId: string, key: string, value: any) => void;
}

function SiteCard({ site, settings, versions, isExpanded, onToggle, onSettingChange }: SiteCardProps) {
  const allScripts = [...site.defaultScripts, ...site.pathScripts];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Site Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{site.icon || '🌐'}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{site.name}</h3>
            <p className="text-sm text-gray-600">{allScripts.length} script(s)</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Scripts */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {allScripts.map((script) => (
            <ScriptCard
              key={script.id}
              siteId={site.id}
              script={script}
              isEnabled={settings[script.id]?.enabled ?? script.defaultEnabled}
              version={versions[script.id]}
              onToggle={(enabled) => onSettingChange(site.id, script.id, 'enabled', enabled)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ScriptCardProps {
  siteId: string;
  script: { id: string; name: string; description: string; };
  isEnabled: boolean;
  version?: string;
  onToggle: (enabled: boolean) => void;
}

function ScriptCard({ script, isEnabled, version, onToggle }: ScriptCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{script.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{script.description}</p>
          {version && <p className="text-xs text-gray-500 mt-1">Version: {version}</p>}
        </div>
        <label className="flex items-center gap-2 cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>
    </div>
  );
}

export default App;
