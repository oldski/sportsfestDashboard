import * as React from 'react';

import { Badge } from '@workspace/ui/components/badge';
import {cn} from "@workspace/ui/lib/utils";

export type SiteHeadingProps = {
  badge?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export function SiteHeading({
  badge,
  title,
  description,
  className
}: SiteHeadingProps): React.JSX.Element {
  return (
    <div className={cn( "mx-auto flex max-w-5xl flex-col items-center gap-6 text-center", className)}>
      {badge && (
        <Badge
          variant="outline"
          className={cn("h-8 rounded-full px-3 text-sm font-medium shadow-xs", className)}
        >
          {badge}
        </Badge>
      )}
      {title && (
        <h1 className="text-pretty text-5xl font-bold lg:text-6xl">{title}</h1>
      )}
      {description && (
        <p className={cn("text-lg text-muted-foreground lg:text-xl", className)}>
          {description}
        </p>
      )}
    </div>
  );
}
