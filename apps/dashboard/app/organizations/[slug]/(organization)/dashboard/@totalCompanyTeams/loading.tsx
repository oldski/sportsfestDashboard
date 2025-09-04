import * as React from 'react';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';

export default function TotalCompanyTeamsLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );
}
