import { useSettings } from "@/webpage/hooks/useSettings";
import { Button } from "../components/ui";
import { cn } from "@/webpage/lib/utils";
import { 
  RefreshCw, 
  Download, 
  Shield, 
  Zap, 
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { SiteIcon } from "../components/SiteIcon";
import { useState, useEffect } from "react";
import type { RemoteScriptsConfig } from '@/core/remote-config';

export const Home = () => {
  const {
    lastCheck,
    isChecking,
    handleCheckUpdates,
    isExtension,
    updateInfo,
    handleApplyUpdates,
    settings,
  } = useSettings();

  const [remoteConfig, setRemoteConfig] = useState<RemoteScriptsConfig | null>(null);

  // Load remote config
  useEffect(() => {
    async function loadConfig() {
      try {
        const result = await new Promise<RemoteScriptsConfig | null>((resolve) => {
          chrome.storage.local.get(['remote_scripts_config'], (result: any) => {
            resolve(result.remote_scripts_config || null);
          });
        });
        setRemoteConfig(result);
      } catch (error) {
        console.error('[Home] Failed to load config:', error);
      }
    }
    loadConfig();
  }, []);

  // Calculate stats from remote config
  const totalScripts = remoteConfig ? Object.values(remoteConfig.sites).reduce((acc, site) => 
    acc + Object.keys(site.scripts).length, 0
  ) : 0;

  const enabledScripts = remoteConfig ? Object.entries(remoteConfig.sites).reduce((acc, [siteId, site]) => {
    const enabled = Object.values(site.scripts).filter(script => {
      const settingKey = `${siteId}/${script.id}`;
      return settings[settingKey]?.enabled ?? script.defaultEnabled;
    }).length;
    return acc + enabled;
  }, 0) : 0;

  const supportedSites = remoteConfig ? Object.keys(remoteConfig.sites).length : 0;

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium mb-4">
                <Zap className="w-3 h-3" />
                Browser Extension
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">
                Web Debloater & Enhancer
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Take control of your browsing experience. Remove clutter, add enhancements, 
                and customize websites to work exactly how you want them to.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3 min-w-[240px]">
              <StatCard
                icon={<Shield className="w-4 h-4" />}
                value={supportedSites.toString()}
                label="Websites"
                color="blue"
              />
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                value={totalScripts.toString()}
                label="Total Scripts"
                color="amber"
              />
              <StatCard
                icon={<CheckCircle2 className="w-4 h-4" />}
                value={enabledScripts.toString()}
                label="Active"
                color="green"
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                value={`${Math.round((enabledScripts / totalScripts) * 100)}%`}
                label="Enabled"
                color="primary"
              />
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid gap-5">
          {/* Update Checker Card */}
          <div className={cn(
            "rounded-lg border bg-card p-5",
            "shadow-sm hover:shadow-md transition-shadow"
          )}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-0.5 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  Selector Updates
                </h2>
                <p className="text-xs text-muted-foreground">
                  Keep your debloating scripts up to date with the latest selectors
                </p>
              </div>
            </div>

            {/* Last Check Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Last checked: {lastCheck 
                  ? new Date(lastCheck).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never'}
              </span>
            </div>

            {/* Update Available Banner */}
            {updateInfo && updateInfo.needsUpdate && (
              <div className={cn(
                "mb-3 p-3 rounded-md border-l-4",
                "bg-blue-50 dark:bg-blue-950/30",
                "border-blue-500"
              )}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-0.5">
                      Update available
                    </p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-300">
                      {updateInfo.localVersion || 'none'} → {updateInfo.remoteVersion}
                    </p>
                  </div>
                  <Button 
                    onClick={handleApplyUpdates}
                    disabled={!isExtension || isChecking}
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Apply Update
                  </Button>
                </div>
              </div>
            )}

            {/* Check Button */}
            <Button
              onClick={handleCheckUpdates}
              disabled={!isExtension || isChecking}
              variant="outline"
              className="w-full sm:w-auto gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isChecking && "animate-spin")} />
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </Button>

            {!isExtension && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-3">
                ⚠️ Update checking is disabled in development mode
              </p>
            )}
          </div>

          {/* Sites Overview */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Supported Websites
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {remoteConfig && Object.entries(remoteConfig.sites).map(([siteId, site]) => {
                const allScripts = Object.values(site.scripts);
                const removalCount = allScripts.filter(s => s.type === 'removal').length;
                const enhancementCount = allScripts.filter(s => s.type === 'enhancement').length;

                return (
                  <div
                    key={siteId}
                    className={cn(
                      "group p-4 rounded-lg border bg-card",
                      "hover:bg-accent/30 transition-all duration-200",
                      "hover:shadow-md hover:-translate-y-0.5"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <SiteIcon siteId={siteId} size={32} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground mb-0.5">
                          {site.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                          {removalCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                              {removalCount} removal{removalCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {enhancementCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {enhancementCount} enhancement{enhancementCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
function StatCard({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
  color: 'blue' | 'amber' | 'green' | 'primary';
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    primary: "bg-primary/10 text-primary"
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border bg-card",
      "transition-all duration-200",
      "hover:shadow-md hover:-translate-y-0.5"
    )}>
      <div className={cn("inline-flex p-1.5 rounded-md mb-1.5", colorClasses[color])}>
        {icon}
      </div>
      <div className="text-xl font-bold text-foreground mb-0.5">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export default Home;