/**
 * Dynamic Site Page
 * 
 * Renders site configuration dynamically from remote config.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/webpage/components/ui/button';
import { useSettings } from '@/webpage/hooks/useSettings';
import { Trash2, Sparkles, Save, Loader2 } from 'lucide-react';
import { DynamicSiteHeader } from '@/webpage/components/layout/dynamic-site/DynamicSiteHeader';
import { DynamicScriptGroup } from '@/webpage/components/layout/dynamic-site/DynamicScriptGroup';
import type { RemoteScriptsConfig, RemoteSiteConfig } from '@/core/remote-config';

interface DynamicSitePageProps {
  siteId: string;
}

export function DynamicSitePage({ siteId }: DynamicSitePageProps) {
  const [siteConfig, setSiteConfig] = useState<RemoteSiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  // Load site config from storage
  useEffect(() => {
    async function loadSiteConfig() {
      setLoading(true);
      try {
        const result = await new Promise<RemoteScriptsConfig | null>((resolve) => {
          chrome.storage.local.get(['remote_scripts_config'], (result: any) => {
            resolve(result.remote_scripts_config || null);
          });
        });

        if (result && result.sites[siteId]) {
          setSiteConfig(result.sites[siteId]);
        } else {
          console.error(`[DynamicSitePage] Site ${siteId} not found in remote config`);
        }
      } catch (error) {
        console.error('[DynamicSitePage] Failed to load config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSiteConfig();
  }, [siteId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!siteConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Configuration not found for {siteId}</p>
      </div>
    );
  }

  const allScripts = Object.values(siteConfig.scripts);
  const siteHasPendingChanges = hasPendingChanges(siteId);

  // Group scripts by type
  const removalScripts = allScripts.filter(s => s.type === 'removal');
  const enhancementScripts = allScripts.filter(s => s.type === 'enhancement');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <DynamicSiteHeader
        siteId={siteId}
        siteName={siteConfig.name}
        scriptCount={allScripts.length}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {removalScripts.length > 0 && (
            <DynamicScriptGroup
              scripts={removalScripts}
              title="Remove Content"
              icon={<Trash2 className="w-4 h-4" />}
              accentColor="red"
              siteId={siteId}
              getCurrentSetting={getCurrentSetting}
              handleSettingChange={handleSettingChange}
            />
          )}
          {enhancementScripts.length > 0 && (
            <DynamicScriptGroup
              scripts={enhancementScripts}
              title="Enhancements"
              icon={<Sparkles className="w-4 h-4" />}
              accentColor="blue"
              siteId={siteId}
              getCurrentSetting={getCurrentSetting}
              handleSettingChange={handleSettingChange}
            />
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      {siteHasPendingChanges && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isExtension 
                  ? 'You have unsaved changes'
                  : 'Preview mode — changes won\'t be saved'}
              </p>
              <Button 
                onClick={() => handleApplyChanges(siteId, siteConfig.name)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
