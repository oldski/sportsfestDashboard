import { TentIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { getAdminOverviewStats } from '~/actions/admin/get-admin-overview-stats';

export default async function TentRentalsPage(): Promise<React.JSX.Element> {
  const stats = await getAdminOverviewStats();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tent Rentals</CardTitle>
        <TentIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalTentRentals}</div>
        <p className="text-xs text-muted-foreground">
          {stats.tentUtilizationRate}% utilization rate
        </p>
      </CardContent>
    </Card>
  );
}