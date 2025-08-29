import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

export async function CompanyManagementCard(): Promise<React.JSX.Element> {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Management</CardTitle>
        <CardDescription>
          Manage all participating companies and their registrations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Company Management Coming Soon</h2>
          <p className="text-muted-foreground">
            This section will contain tools for managing companies, viewing their
            registration status, and overseeing organizational participation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}