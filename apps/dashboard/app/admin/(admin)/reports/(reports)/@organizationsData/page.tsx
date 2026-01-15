import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Building2Icon } from 'lucide-react';
import { OrganizationStatusChart } from '~/components/admin/charts/organization-status-chart';
import { getOrganizationStats } from '~/actions/admin/get-organization-stats';

export default async function OrganizationsDataPage(): Promise<React.JSX.Element> {
  const stats = await getOrganizationStats();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Building2Icon className="mr-2 h-4 w-4" />
          Organizations Overview
        </CardTitle>
        <CardDescription>
          Organizational metrics and registration status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Total Orgs</p>
            <p className="text-xl font-bold">{stats.totalOrganizations}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold text-green-600">{stats.activeOrganizations}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">New This Year</p>
            <p className="text-xl font-bold text-blue-600">{stats.newOrganizations}</p>
          </div>
        </div>
        <OrganizationStatusChart data={stats.byRegistrationStatus} />
      </CardContent>
    </Card>
  );
}