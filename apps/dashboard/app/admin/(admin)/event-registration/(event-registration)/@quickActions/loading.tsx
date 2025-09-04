import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function QuickActionsLoading(): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
