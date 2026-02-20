import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function TotalCompanyTeamsLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            Company Teams
          </CardTitle>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="border-l pl-4">
            <Skeleton className="h-6 w-8 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="border-l pl-4">
            <Skeleton className="h-6 w-8 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-4 py-2 border-b">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-14 ml-auto" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-12 ml-auto" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
