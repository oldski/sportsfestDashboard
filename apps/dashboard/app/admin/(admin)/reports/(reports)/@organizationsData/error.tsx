'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface OrganizationsDataErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrganizationsDataError({ error, reset }: OrganizationsDataErrorProps): React.JSX.Element {
  return (
    <Card className="border-destructive">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center text-destructive">
          <AlertTriangleIcon className="mr-2 h-4 w-4" />
          Organizations Data Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Failed to load organizations data. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={reset}>
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}