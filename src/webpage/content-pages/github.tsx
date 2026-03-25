import { Checkbox } from '@/webpage/components/ui/checkbox';
import { Button } from '@/webpage/components/ui/button';
import { SCRIPTS_CONFIG, ScriptConfig } from '@config/scripts';
import { useSettings } from '@/webpage/hooks/useSettings';
import { cn } from '@/webpage/lib/utils';
import { Trash2, Sparkles, Save } from 'lucide-react';
import { SiteIcon } from '@/webpage/components/SiteIcon';

export function GitHubPage() {
  const {
    versions,
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  const site = SCRIPTS_CONFIG.find(s => s.id === 'github');
  
  if (!site) {
    return <div>Site configuration not found</div>;
  }

  const allScripts = [...site.defaultScripts, ...site.pathScripts];
  const siteHasPendingChanges = hasPendingChanges(site.id);

  // Group scripts by type
  const removalScripts = allScripts.filter(s => s.type === 'removal');
  const enhancementScripts = allScripts.filter(s => s.type === 'enhancement');

  const renderScriptGroup = (scripts: ScriptConfig[], title: string, icon: React.ReactNode, accentColor: string) => {
    if (scripts.length === 0) return null;

    return (
      <div className="space-y-2">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "p-1.5 rounded-md",
            accentColor === 'red' && "bg-red-500/10 text-red-600 dark:text-red-400",
            accentColor === 'blue' && "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          )}>
            {icon}
          </div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-3" />
        </div>

        {/* Scripts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {scripts.map((script) => {
            const isEnabled = Boolean(getCurrentSetting(site.id, script.id, 'enabled', script.defaultEnabled));
            const version = versions[site.id]?.[script.id];

            return (
              <label
                key={script.id}
                htmlFor={`${site.id}-${script.id}`}
                className={cn(
                  "group relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer",
                  "bg-card hover:bg-accent/30 border-border",
                  "transition-all duration-200",
                  "hover:shadow-md hover:-translate-y-0.5",
                  isEnabled && "ring-1 ring-primary/20"
                )}
              >
                <Checkbox
                  id={`${site.id}-${script.id}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange(site.id, script.id, 'enabled', checked === true)
                  }
                  className="mt-0.5 transition-transform group-hover:scale-110"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground mb-0.5">
                    {script.name}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {script.description}
                  </p>
                  {version && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      v{version}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-slate-500/10 to-slate-600/5",
              "ring-1 ring-slate-500/20"
            )}>
              <SiteIcon siteId="github" size={28} />
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
          {renderScriptGroup(removalScripts, 'Remove Content', <Trash2 className="w-4 h-4" />, 'red')}
          {renderScriptGroup(enhancementScripts, 'Enhancements', <Sparkles className="w-4 h-4" />, 'blue')}
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
