import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

export async function CompanyPerformanceComparison(): Promise<React.JSX.Element> {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Performance Comparison</CardTitle>
        <CardDescription>
          Compare performance metrics across all participating companies
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Performance Comparison Coming Soon</h2>
          <p className="text-muted-foreground">
            This section will display company rankings, performance metrics,
            and comparative analytics across all organizations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}