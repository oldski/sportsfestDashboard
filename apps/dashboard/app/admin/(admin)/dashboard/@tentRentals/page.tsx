import Link from 'next/link';
import {CircleIcon, ExternalLinkIcon, TentIcon} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';

import { getAdminOverviewStats } from '~/actions/admin/get-admin-overview-stats';

export default async function TentRentalsPage(): Promise<React.JSX.Element> {
  const stats = await getAdminOverviewStats();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <Link href="/admin/tents" className="block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <TentIcon className="h-5 w-5"/>
            Tent Rentals
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />

          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTentRentals}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={stats.tentUtilizationRate} className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {stats.tentUtilizationRate}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Utilization rate • Click to manage
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
