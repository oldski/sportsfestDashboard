import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function ProductManagementLoading(): React.JSX.Element {
  return (
    <div className="space-y-2 mt-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}
