import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type CardProps
} from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';

export type LeadGenerationSkeletonCardProps = CardProps;

export function LeadGenerationSkeletonCard({
  className,
  ...props
}: LeadGenerationSkeletonCardProps): React.JSX.Element {
  return (
    <Card
      className={cn('pt-0', className)}
      {...props}
    >
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-sm">Lead generation</CardTitle>
          <CardDescription>New contacts added to the pool.</CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <Skeleton className="h-4 w-[39px]" />
            <Skeleton className="size-9" />
          </div>
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-9" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-6">
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}
