# Example Components

Production-ready component patterns that embody distinctive design principles.

## Feature Grid with Asymmetry

Breaks the "three equal columns" pattern with a featured first item.

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric?: { label: string; value: string };
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <article
          key={feature.title}
          className={cn(
            // Base styles
            "group relative p-6 rounded-lg border transition-all duration-200",
            "bg-white dark:bg-zinc-800",
            "border-zinc-200 dark:border-zinc-700",
            // Hover effect
            "hover:border-zinc-300 dark:hover:border-zinc-600",
            "hover:shadow-lg hover:-translate-y-1",
            // Featured item (first one spans 2 columns)
            index === 0 && "md:col-span-2 lg:col-span-1 lg:row-span-2"
          )}
        >
          {/* Icon with accent glow */}
          <div className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4",
            "bg-blue-50 dark:bg-blue-500/10",
            "text-blue-600 dark:text-blue-400",
            "ring-1 ring-blue-500/20",
            "transition-transform duration-200 group-hover:scale-110"
          )}>
            {feature.icon}
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {feature.title}
          </h3>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {feature.description}
          </p>

          {/* Optional metric */}
          {feature.metric && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {feature.metric.value}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">
                {feature.metric.label}
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
```

## Stats Dashboard with Visual Hierarchy

Uses varied card sizes and positions to create visual interest.

```tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

export function StatsOverview({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const isPositive = stat.trend === 'up';
        
        return (
          <div
            key={stat.label}
            className={cn(
              "relative p-6 rounded-lg border transition-all duration-200",
              "bg-white dark:bg-zinc-800",
              "border-zinc-200 dark:border-zinc-700",
              // First stat gets special treatment
              index === 0 && [
                "sm:col-span-2 lg:col-span-1",
                "border-l-4 border-l-blue-500",
                "shadow-lg shadow-blue-500/10"
              ],
              "hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            {/* Label */}
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {stat.label}
            </div>

            {/* Value */}
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {stat.value}
            </div>

            {/* Trend indicator */}
            <div className={cn(
              "inline-flex items-center gap-1 text-sm font-medium",
              isPositive 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(stat.change)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## Tab Navigation with Smooth Indicator

Active state is communicated through position and color, not just opacity.

```tsx
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export function TabNavigation({ tabs, defaultTab }: { tabs: Tab[]; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="relative">
      {/* Tab bar with subtle background */}
      <div className={cn(
        "inline-flex gap-1 p-1 rounded-lg",
        "bg-zinc-100 dark:bg-zinc-800",
        "border border-zinc-200 dark:border-zinc-700"
      )}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isActive ? [
                  "bg-white dark:bg-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "shadow-sm"
                ] : [
                  "text-zinc-600 dark:text-zinc-400",
                  "hover:text-zinc-900 dark:hover:text-zinc-200"
                ]
              )}
            >
              <span className="flex items-center gap-2">
                {tab.icon && (
                  <span className={cn(
                    "transition-colors",
                    isActive && "text-blue-500"
                  )}>
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

## Empty State with Personality

Transforms a boring "no data" into an opportunity for brand voice.

```tsx
import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  action,
  icon = <Inbox className="w-12 h-12" />
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      "max-w-md mx-auto"
    )}>
      {/* Icon with soft background */}
      <div className={cn(
        "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6",
        "bg-zinc-100 dark:bg-zinc-800",
        "text-zinc-400 dark:text-zinc-600",
        "ring-1 ring-zinc-200 dark:ring-zinc-700"
      )}>
        {icon}
      </div>

      {/* Title with weight */}
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>

      {/* Description with good line height */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        {description}
      </p>

      {/* Optional CTA */}
      {action && (
        <Button 
          onClick={action.onClick}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

## Loading Skeleton with Staggered Animation

Better than spinners for content-heavy interfaces.

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "p-6 rounded-lg border",
            "bg-white dark:bg-zinc-800",
            "border-zinc-200 dark:border-zinc-700",
            "animate-pulse"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Icon skeleton */}
          <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-700 mb-4" />
          
          {/* Title skeleton */}
          <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 mb-3" />
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Design Notes

Each example demonstrates:
- **Visual hierarchy**: Multiple font sizes and weights
- **Intentional spacing**: Consistent but varied padding/margins
- **Dark mode consideration**: Separate color choices, not inversions
- **Micro-interactions**: Smooth hover states and transitions
- **Creative layouts**: Asymmetry and visual interest
- **Performance**: Using transforms for animations
- **Accessibility**: Focus states and semantic HTML
