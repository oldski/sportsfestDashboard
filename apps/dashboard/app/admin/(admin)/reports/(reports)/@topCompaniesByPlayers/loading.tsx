import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function TopCompaniesByPlayersLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            Top Companies by Player Count
          </CardTitle>
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 flex-1" style={{ maxWidth: `${90 - i * 8}%` }} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
