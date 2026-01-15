import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { BuildingIcon } from 'lucide-react';
import { getTopOrganizations } from '~/actions/admin/get-organization-stats';
import { formatCurrency } from '~/lib/formatters';

export default async function TopOrganizationsPage(): Promise<React.JSX.Element> {
  const topOrgs = await getTopOrganizations();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <BuildingIcon className="mr-2 h-4 w-4" />
          Top Organizations
        </CardTitle>
        <CardDescription>
          Highest performing organizations by revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topOrgs.length === 0 ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-sm text-muted-foreground">No organization revenue data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topOrgs.map((org) => (
              <div key={org.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-muted-foreground">#{org.rank}</span>
                  <span className="text-sm font-medium">{org.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(org.totalRevenue)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}