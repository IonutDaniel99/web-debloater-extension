import { cn } from '@/webpage/lib/utils';

const INVERT_COLORS_SITES = ['github']; // List of site IDs that require color inversion for icons

interface SiteIconProps {
  siteId: string;
  className?: string;
  size?: number;
}

/**
 * Renders a site icon from the public/icons folder
 * Falls back to emoji if icon file doesn't exist
 */
export function SiteIcon({ siteId, className, size = 40 }: SiteIconProps) {
  const iconMap: Record<string, { path: string; fallback: string }> = {
    home: { path: '/icons/home.svg', fallback: '🏠' },
    youtube: { path: '/icons/youtube.svg', fallback: '🎥' },
    github: { path: '/icons/github.svg', fallback: '🐙' },
  };

  const config = iconMap[siteId];
  
  if (!config) {
    return <span className={cn("text-2xl", className)}>🌐</span>;
  }

  return (
    <img
      src={config.path}
      alt={`${siteId} icon`}
      width={size}
      height={size}
      className={cn("flex-shrink-0", className, INVERT_COLORS_SITES.includes(siteId) && "dark:invert")}
      onError={(e) => {
        // Fallback to emoji if SVG fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = config.fallback;
        span.className = cn("text-2xl", className, INVERT_COLORS_SITES.includes(siteId) && "dark:invert");
        target.parentNode?.insertBefore(span, target);
      }}
    />
  );
}
