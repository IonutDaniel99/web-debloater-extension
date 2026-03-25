import { cn } from "@/webpage/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { PagesInterface } from "../MainLayout/MainLayout";
import { SCRIPTS_CONFIG } from "@config/scripts";
import { useSettings } from "@/webpage/hooks/useSettings";
import { ModeToggle } from "../../mode-toggle";



export function Sidebar({ pages }: { pages: PagesInterface[] }) {
  const location = useLocation();
  const { isExtension } = useSettings();

  return (
    <div className="w-80 border-r border-border bg-card h-full flex flex-col">
      {!isExtension && (
        <div className="sticky top-0 w-full bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2 text-amber-900">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              Development Mode
            </span>
          </div>
        </div>
      )}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">Web Debloater</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage website modifications
        </p>
      </div>

      <nav className="p-2 flex-1">
        <div className="space-y-1">
          {pages.map((page) => {
            const isActive = location.pathname === page.path;
            const site = SCRIPTS_CONFIG.find(s => s.id === page.id);

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
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-2 border-t border-border">
        <ModeToggle />
      </div>
    </div>
  );
}
