import Link from 'next/link';
import { BuildingIcon, ExternalLinkIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { getAdminOverviewStats } from '~/actions/admin/get-admin-overview-stats';

export default async function TotalCompaniesPage(): Promise<React.JSX.Element> {
  const stats = await getAdminOverviewStats();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <Link href="/admin/organizations" className="block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          <div className="flex items-center space-x-2">
            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newCompaniesThisMonth} this month • Click to manage
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}