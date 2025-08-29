import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

export function OrganizationReports(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Reports</CardTitle>
        <CardDescription>
          Detailed reporting and analytics for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Organization Reports Coming Soon</h2>
          <p className="text-muted-foreground">
            This section will contain organization-specific reporting and analytics features
            including player statistics, team performance, financial reports, and more.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}