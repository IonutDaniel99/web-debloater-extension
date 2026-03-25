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
  return (
    <img
      src={`/icons/${siteId}.svg`}
      alt={`${siteId} icon`}
      width={size}
      height={size}
      className={cn("flex-shrink-0", className, INVERT_COLORS_SITES.includes(siteId) && "dark:invert")}
    />
  );
}
