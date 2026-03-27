import { SiteIcon } from '@/webpage/components/SiteIcon';

interface DynamicSiteHeaderProps {
  siteId: string;
  siteName: string;
  scriptCount: number;
}

export function DynamicSiteHeader({ siteId, siteName, scriptCount }: DynamicSiteHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <SiteIcon siteId={siteId} size={24} />
          <div>
            <h1 className="text-lg font-semibold text-foreground">{siteName}</h1>
            <p className="text-xs text-muted-foreground">
              {scriptCount} script{scriptCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
