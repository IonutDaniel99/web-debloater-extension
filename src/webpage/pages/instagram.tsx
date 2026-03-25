import { Button } from '@/webpage/components/ui/button';
import { useSettings } from '@/webpage/hooks/useSettings';
import { cn } from '@/webpage/lib/utils';
import { Trash2, Sparkles, Save } from 'lucide-react';
import { SiteIcon } from '@/webpage/components/SiteIcon';
import { RenderScriptGroup } from '@/webpage/components/RenderScriptGroup';
import { INSTAGRAM_CONFIG } from '@/page-scripts/instagram/instagram_config';

const SITE_ID = 'instagram';

export function InstagramPage() {
  const {
    versions,
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  const site = INSTAGRAM_CONFIG;
  
  if (!site) {
    return <div>Site configuration not found</div>;
  }

  const allScripts = [...site.defaultScripts, ...site.pathScripts];
  const siteHasPendingChanges = hasPendingChanges(site.id);

  // Group scripts by type
  const removalScripts = allScripts.filter(s => s.type === 'removal');
  const enhancementScripts = allScripts.filter(s => s.type === 'enhancement');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-pink-500/10 to-pink-600/5",
              "ring-1 ring-pink-500/20"
            )}>
              <SiteIcon siteId={SITE_ID} size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{site.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage {allScripts.length} script{allScripts.length !== 1 ? 's' : ''} 
                {removalScripts.length > 0 && ` • ${removalScripts.length} removal${removalScripts.length !== 1 ? 's' : ''}`}
                {enhancementScripts.length > 0 && ` • ${enhancementScripts.length} enhancement${enhancementScripts.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <RenderScriptGroup
            scripts={removalScripts}
            title="Remove Content"
            icon={<Trash2 className="w-4 h-4" />}
            accentColor="red"
            siteId={site.id}
            versions={versions}
            getCurrentSetting={getCurrentSetting}
            handleSettingChange={handleSettingChange}
          />
          <RenderScriptGroup
            scripts={enhancementScripts}
            title="Enhancements"
            icon={<Sparkles className="w-4 h-4" />}
            accentColor="blue"
            siteId={site.id}
            versions={versions}
            getCurrentSetting={getCurrentSetting}
            handleSettingChange={handleSettingChange}
          />
        </div>
      </div>

      {/* Apply Button (Floating) */}
      {siteHasPendingChanges && (
        <div className={cn(
          "sticky bottom-0 border-t bg-card/95 backdrop-blur-sm",
          "shadow-2xl shadow-black/10"
        )}>
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Unsaved changes
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isExtension 
                    ? 'Changes will be applied and active tabs will be refreshed'
                    : 'Apply button is disabled in development mode'}
                </p>
              </div>
              <Button 
                onClick={() => handleApplyChanges(site.id, site.name)}
                disabled={!isExtension}
                size="lg"
                className={cn(
                  "gap-2 shadow-lg transition-all duration-200",
                  "hover:shadow-xl hover:scale-105"
                )}
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
