import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function EventYearStatsLoading(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      
      {/* Chart or additional content */}
      <div className="p-4 border rounded-lg space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
