import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { PagesInterface } from "../MainLayout/MainLayout";
import { SCRIPTS_CONFIG } from "@config/scripts";
import { useSettings } from "@/webpage/hooks/useSettings";

export function Sidebar({ pages }: { pages: PagesInterface[] }) {
  const location = useLocation();
  const { hasPendingChanges } = useSettings();

  return (
    <div className="w-80 border-r border-border bg-card">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">Web Debloater</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage website modifications
        </p>
      </div>

      <nav className="p-2">
        <div className="space-y-1">
          {pages.map((page) => {
            const isActive = location.pathname === page.path;
            const site = SCRIPTS_CONFIG.find(s => s.id === page.id);
            const allScripts = site ? [...site.defaultScripts, ...site.pathScripts] : [];
            
            return (
              <Link
                key={page.id}
                to={page.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <span className="text-xl">{site?.icon || '🌐'}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{site?.name || page.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {allScripts.length} script{allScripts.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {hasPendingChanges(page.id) && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
