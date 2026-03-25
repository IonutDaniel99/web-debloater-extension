import { Checkbox } from '@/webpage/components/ui/checkbox';
import { Button } from '@/webpage/components/ui/button';
import { SCRIPTS_CONFIG } from '@config/scripts';
import { useSettings } from '@/webpage/hooks/useSettings';

export function YouTubePage() {
  const {
    versions,
    handleSettingChange,
    handleApplyChanges,
    getCurrentSetting,
    hasPendingChanges,
    isExtension,
  } = useSettings();

  const site = SCRIPTS_CONFIG.find(s => s.id === 'youtube');
  
  if (!site) {
    return <div>Site configuration not found</div>;
  }

  const allScripts = [...site.defaultScripts, ...site.pathScripts];
  const siteHasPendingChanges = hasPendingChanges(site.id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{site.icon || '🌐'}</span>
          <div>
            <h2 className="text-2xl font-bold">{site.name}</h2>
            <p className="text-sm text-muted-foreground">
              Configure {allScripts.length} script{allScripts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Scripts List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {allScripts.map((script) => {
            const isEnabled = Boolean(getCurrentSetting(site.id, script.id, 'enabled', script.defaultEnabled));
            const version = versions[site.id]?.[script.id];

            return (
              <div
                key={script.id}
                className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  id={`${site.id}-${script.id}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange(site.id, script.id, 'enabled', checked === true)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`${site.id}-${script.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {script.name}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {script.description}
                  </p>
                  {version && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Version: {version}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Button (Fixed at bottom) */}
      {siteHasPendingChanges && (
        <div className="border-t border-border p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Unsaved changes</p>
              <p className="text-xs text-muted-foreground">
                {isExtension 
                  ? 'Click apply to save and reload tabs'
                  : 'Apply button is disabled in development mode'}
              </p>
            </div>
            <Button 
              onClick={() => handleApplyChanges(site.id, site.name)}
              disabled={!isExtension}
            >
              Apply Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

