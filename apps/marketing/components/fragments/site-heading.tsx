import * as React from 'react';

import { Badge } from '@workspace/ui/components/badge';
import {cn} from "@workspace/ui/lib/utils";

export type SiteHeadingProps = {
  badge?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
};

export function SiteHeading({
  badge,
  title,
  description,
  className,
  variant = 'dark'
}: SiteHeadingProps): React.JSX.Element {
  const isLight = variant === 'light';

  return (
    <div className={cn( "mx-auto flex max-w-5xl flex-col items-center gap-6 text-center", className)}>
      {badge && (
        <Badge
          variant="default"
          className={cn(
            "h-8 rounded-full px-3 text-sm font-medium",
            isLight ? "text-primary bg-white drop-shadow-md" : "shadow-xs"
          )}
        >
          {badge}
        </Badge>
      )}
      {title && (
        <h1 className={cn(
          "text-pretty text-5xl font-bold lg:text-6xl",
          isLight ? "text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]" : "text-primary"
        )}>
          {title}
        </h1>
      )}
      {description && (
        <p className={cn(
          "text-lg lg:text-xl",
          isLight ? "font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]" : "text-primary/80",
          className
        )}>
          {description}
        </p>
      )}
    </div>
  );
}
