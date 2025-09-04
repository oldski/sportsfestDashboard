import * as React from 'react';
import { TrendingUpIcon, UsersIcon, DollarSignIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { getAdminAnalytics } from '~/actions/admin/get-admin-analytics';
import { OrganizationGrowthChart } from './charts/organization-growth-chart';
import { UserGrowthChart } from './charts/user-growth-chart';
import { RevenueByTypeChart } from './charts/revenue-by-type-chart';

export async function EventAnalyticsCard(): Promise<React.JSX.Element> {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-4">
      {/* Top Organizations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Organizations</CardTitle>
          <CardDescription>Organizations by member count and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topOrganizations.slice(0, 5).map((org, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">{org.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {org.memberCount} members
                  </div>
                </div>
                <Badge variant="outline">${org.revenue.toLocaleString()}</Badge>
              </div>
            ))}
            {analytics.topOrganizations.length === 0 && (
              <p className="text-sm text-muted-foreground">No organization data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
