import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function OrganizationsTableLoading(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Search and actions bar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="border-b px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3 last:border-0">
            <div className="grid grid-cols-5 gap-4 items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-8" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}
