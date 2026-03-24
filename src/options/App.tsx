import { useState, useEffect } from 'react';
import { SITES_CONFIG, type Site, type Zone, type ZoneSetting } from '@config/zones';
import type { ZoneSettings, ZoneVersions } from '@core/storage-manager';
import type { UpdateCheckResult } from '@core/update-checker';

function App() {
  const [settings, setSettings] = useState<ZoneSettings>({});
  const [versions, setVersions] = useState<ZoneVersions>({});
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);

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

    // Send to background script
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTING',
      siteId,
      zoneId,
      key,
      value,
    });

    // Notify background to refresh tabs
    await chrome.runtime.sendMessage({ type: 'SETTINGS_CHANGED' });
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
    if (!updateInfo || updateInfo.updatesAvailable.length === 0) return;

    setIsChecking(true);
    const response = await chrome.runtime.sendMessage({
      type: 'APPLY_UPDATES',
      updates: updateInfo.updatesAvailable,
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

        {updateInfo && updateInfo.updatesAvailable.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {updateInfo.updatesAvailable.length} update(s) available
                </p>
                <ul className="mt-2 text-sm text-blue-800">
                  {updateInfo.updatesAvailable.map((u) => (
                    <li key={`${u.site}-${u.zone}`}>
                      {u.site}/{u.zone}: {u.localVersion || 'none'} → {u.remoteVersion}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleApplyUpdates}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Updates
              </button>
            </div>
          </div>
        )}

        {updateInfo && updateInfo.updatesAvailable.length === 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-900">All zones are up to date!</p>
          </div>
        )}

        {updateInfo && !updateInfo.success && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-900">Error: {updateInfo.error}</p>
          </div>
        )}
      </div>

      {/* Sites Section */}
      <div className="space-y-4">
        {SITES_CONFIG.map((site) => (
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
  site: Site;
  settings: { [zoneId: string]: { [key: string]: any } };
  versions: { [zoneId: string]: string };
  isExpanded: boolean;
  onToggle: () => void;
  onSettingChange: (siteId: string, zoneId: string, key: string, value: any) => void;
}

function SiteCard({ site, settings, versions, isExpanded, onToggle, onSettingChange }: SiteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Site Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{site.icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{site.name}</h3>
            <p className="text-sm text-gray-600">{site.zones.length} zone(s)</p>
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

      {/* Zones */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {site.zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              siteId={site.id}
              zone={zone}
              settings={settings[zone.id] || {}}
              version={versions[zone.id]}
              onSettingChange={onSettingChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ZoneCardProps {
  siteId: string;
  zone: Zone;
  settings: { [key: string]: any };
  version?: string;
  onSettingChange: (siteId: string, zoneId: string, key: string, value: any) => void;
}

function ZoneCard({ siteId, zone, settings, version, onSettingChange }: ZoneCardProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{zone.name}</h4>
          <p className="text-sm text-gray-600">{zone.description}</p>
          {version && <p className="text-xs text-gray-500 mt-1">Version: {version}</p>}
        </div>
      </div>

      <div className="space-y-3">
        {zone.settings.map((setting) => (
          <SettingControl
            key={setting.key}
            siteId={siteId}
            zoneId={zone.id}
            setting={setting}
            value={settings[setting.key] ?? setting.default}
            onChange={onSettingChange}
          />
        ))}
      </div>
    </div>
  );
}

interface SettingControlProps {
  siteId: string;
  zoneId: string;
  setting: ZoneSetting;
  value: any;
  onChange: (siteId: string, zoneId: string, key: string, value: any) => void;
}

function SettingControl({ siteId, zoneId, setting, value, onChange }: SettingControlProps) {
  if (setting.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(siteId, zoneId, setting.key, e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">{setting.label}</span>
          <p className="text-xs text-gray-600">{setting.description}</p>
        </div>
      </label>
    );
  }

  // Add more control types as needed (select, number, etc.)
  return null;
}

export default App;
