import { Checkbox } from '@/webpage/components/ui/checkbox';
import { cn } from '@/webpage/lib/utils';
import type { RemoteScriptConfig } from '@/core/remote-config';

interface DynamicScriptGroupProps {
  scripts: RemoteScriptConfig[];
  title: string;
  icon: React.ReactNode;
  accentColor: 'red' | 'blue';
  siteId: string;
  getCurrentSetting: (siteId: string, scriptId: string, key: string) => any;
  handleSettingChange: (siteId: string, scriptId: string, key: string, value: any) => void;
}

export function DynamicScriptGroup({
  scripts,
  title,
  icon,
  accentColor,
  siteId,
  getCurrentSetting,
  handleSettingChange,
}: DynamicScriptGroupProps) {
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
          const isEnabled = Boolean(
            getCurrentSetting(siteId, script.id, 'enabled') ?? script.defaultEnabled
          );

          return (
            <label
              key={script.id}
              htmlFor={`${siteId}-${script.id}`}
              className={cn(
                "group relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer",
                "bg-card hover:bg-accent/30 border-border",
                "transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5",
                isEnabled && "ring-1 ring-primary/20"
              )}
            >
              <Checkbox
                id={`${siteId}-${script.id}`}
                checked={isEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange(siteId, script.id, 'enabled', checked === true)
                }
                className="mt-0.5 transition-transform group-hover:scale-110"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-foreground mb-0.5">
                    {script.name}
                  </div>
                  {script.bundled && (
                    <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      CUSTOM
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">
                  {script.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
