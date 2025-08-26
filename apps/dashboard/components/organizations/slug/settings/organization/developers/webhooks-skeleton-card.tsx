import * as React from 'react';

import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';

export function WebhooksSkeletonCard({
  className,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <Card
      className={cn('pt-0 gap-0', className)}
      {...props}
    >
      <CardContent>
        <div className="flex flex-row justify-between">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-[200px]" />
              <div className="flex flex-row gap-1">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[120px]" />
              </div>
            </div>
          </div>
          <Skeleton className="size-8" />
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex w-full justify-end pt-6">
        <Skeleton className="h-9 w-16" />
      </CardFooter>
    </Card>
  );
}
