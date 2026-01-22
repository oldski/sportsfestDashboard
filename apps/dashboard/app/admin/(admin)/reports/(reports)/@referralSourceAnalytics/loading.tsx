import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function ReferralSourceAnalyticsLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mt-1.5" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-16 ml-auto" />
          <Skeleton className="h-3 w-24 mt-1" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 h-[320px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 flex-1" style={{ maxWidth: `${Math.max(20, 100 - i * 10)}%` }} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}