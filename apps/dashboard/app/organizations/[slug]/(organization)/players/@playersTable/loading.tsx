import * as React from 'react';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function PlayersTableLoading(): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
