'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Loading Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          There was a problem loading this section.
        </p>
        <Button onClick={reset} variant="outline" size="sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
