'use client';

import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function OrganizationPerformanceError({ error, reset }: ErrorProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          Organization Performance Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Failed to load organization performance data.
          </p>
          <button
            onClick={reset}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </CardContent>
    </Card>
  );
}