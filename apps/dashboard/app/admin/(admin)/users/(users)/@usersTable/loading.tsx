import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';

export default function UsersTableLoading(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Search and actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Skeleton className="h-10 w-64" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Table header */}
        <div className="border-b px-4 py-3">
          <div className="grid grid-cols-7 gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b px-4 py-3 last:border-0">
            <div className="grid grid-cols-7 gap-4 items-center">
              {/* User (avatar + name + email) */}
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              {/* Role badge */}
              <Skeleton className="h-6 w-20 rounded-full" />
              {/* Organization */}
              <Skeleton className="h-4 w-28" />
              {/* Status badge */}
              <Skeleton className="h-6 w-14 rounded-full" />
              {/* Last Login */}
              <Skeleton className="h-4 w-20" />
              {/* Created */}
              <Skeleton className="h-4 w-20" />
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-8" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}