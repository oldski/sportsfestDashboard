import * as React from 'react';
import Link from 'next/link';
import { BuildingIcon, CreditCardIcon, TentIcon, UsersIcon, ExternalLinkIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { getAdminOverviewStats } from '~/actions/admin/get-admin-overview-stats';

export async function AdminOverviewCards(): Promise<React.JSX.Element> {
  const stats = await getAdminOverviewStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <Link href="/admin/users" className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <div className="flex items-center space-x-2">
              <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newPlayersThisMonth} registered this month • Click to manage
            </p>
          </CardContent>
        </Link>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +${stats.revenueThisMonth.toLocaleString()} this month
          </p>
        </CardContent>
      </Card>
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
    </div>
  );
}