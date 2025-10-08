import * as React from 'react';

import { Card, CardContent, CardFooter, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

function ProductCardSkeleton(): React.JSX.Element {
  return (
    <Card className="h-full flex flex-col p-4">
      <CardHeader className="px-0">
        <div className="flex items-start justify-between gap-3 h-full">
          {/* Image skeleton */}
          <Skeleton className="aspect-square w-1/3 rounded-lg" />

          <div className="flex flex-col items-between h-full w-2/3 py-2">
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <Skeleton className="h-6 w-3/4" />

              {/* Badges skeleton */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            <div className="space-y-1">
              {/* Price skeleton */}
              <Skeleton className="h-6 w-20" />
              {/* Deposit skeleton */}
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-3 justify-between h-full px-0">
        {/* Description collapsible skeleton */}
        <div className="bg-muted/50 p-2 rounded-lg">
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="space-y-3">
          {/* Payment options skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>

          {/* Quantity selector skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>

          {/* Price summary skeleton */}
          <div className="bg-muted/50 p-2 rounded-lg space-y-1">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function ProductsLoading(): React.JSX.Element {
  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}
