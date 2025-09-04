import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function SystemAlertsLoading(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
