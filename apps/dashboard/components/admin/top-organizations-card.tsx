import * as React from 'react';
import { BuildingIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { getTopOrganizations } from '~/actions/admin/get-top-organizations';

export async function TopOrganizationsCard(): Promise<React.JSX.Element> {
  const topOrganizations = await getTopOrganizations(8);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <BuildingIcon className="mr-2 h-4 w-4" />
          Top Organizations
        </CardTitle>
        <CardDescription>Organizations by member count and revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topOrganizations.slice(0, 5).map((org, index) => (
            <div key={org.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <div>
                <div className="font-medium text-sm">{org.name}</div>
                <div className="text-xs text-muted-foreground">
                  {org.memberCount} members
                </div>
              </div>
              <Badge variant="outline">${org.revenue.toLocaleString()}</Badge>
            </div>
          ))}
          {topOrganizations.length === 0 && (
            <p className="text-sm text-muted-foreground">No organization data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}