import { useState } from "react";
import { cn } from "@/webpage/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Search, X, Home as HomeIcon } from "lucide-react";
import { SCRIPTS_CONFIG } from "@/page-scripts/scripts";
import { ModeToggle } from "../../ModeToggle";
import { SiteIcon } from "../../SiteIcon";
import { PagesInterface } from "../../../configs/pages";

export function Sidebar({ pages }: { pages: PagesInterface[] }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter pages based on search query
  const filteredPages = pages.filter((page) => {
    if (!searchQuery) return true;
    const site = SCRIPTS_CONFIG.find(s => s.id === page.id);
    const name = site?.name || page.id;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <aside className="w-64 border-r border-border bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Web Debloater & Enhancer
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Clean browsing experience
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className={cn(
              "w-full pl-8 pr-8 py-1.5 rounded-md text-xs",
              "bg-background border border-input",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "transition-all duration-200"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-200"
              )}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {filteredPages.map((page) => {
            const isActive = location.pathname === page.path;
            const site = SCRIPTS_CONFIG.find(s => s.id === page.id);
            const isHomePage = page.id === 'home';

            return (
              <Link
                key={page.id}
                to={page.path}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-md",
                  "transition-all duration-200",
                  isActive ? [
                    "bg-primary/10 text-primary",
                    "shadow-sm shadow-primary/10",
                    "border-l-4 border-primary pl-[10px]"
                  ] : [
                    "hover:bg-accent/50 text-foreground",
                    "hover:translate-x-1"
                  ]
                )}
              >
                {isHomePage ? (
                  <HomeIcon className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                ) : (
                  <SiteIcon
                    siteId={page.id}
                    size={18}
                    className={cn(
                      "transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-105"
                    )}
                  />
                )}
                <div className="flex-1">
                  <div className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {site?.name || (isHomePage ? 'Home' : page.id)}
                  </div>
                  {site && (
                    <div className="text-[10px] text-muted-foreground">
                      {[...site.defaultScripts, ...site.pathScripts].length} scripts
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* No results message */}
        {filteredPages.length === 0 && (
          <div className="text-center py-6 px-3">
            <Search className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No pages match "{searchQuery}"
            </p>
          </div>
        )}
      </nav>

      {/* Footer with theme toggle */}
      <div className="p-3 border-t border-border bg-card/50">
        <ModeToggle />
      </div>
    </aside>
  );
}
