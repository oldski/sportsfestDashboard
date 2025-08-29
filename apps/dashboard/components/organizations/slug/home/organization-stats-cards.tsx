import * as React from 'react';
import Link from 'next/link';
import { 
  UsersIcon, 
  TentIcon, 
  CreditCardIcon, 
  PlayIcon,
  AlertTriangleIcon,
  CheckCircleIcon 
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { Button } from '@workspace/ui/components/button';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

export async function OrganizationStatsCards(): Promise<React.JSX.Element> {
  const stats = await getOrganizationDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Teams Card */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <Link href="/teams" className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teams.activeEventYear}</div>
            <p className="text-xs text-muted-foreground">
              {stats.currentEventYear.year} • {stats.teams.total} total
            </p>
          </CardContent>
        </Link>
      </Card>

      {/* Players Card */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <Link href="/players" className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players</CardTitle>
            <PlayIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.players.activeEventYear}</div>
            <p className="text-xs text-muted-foreground">
              {stats.currentEventYear.year} • {stats.players.total} total
            </p>
          </CardContent>
        </Link>
      </Card>

      {/* Tent Tracking Card */}
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
        stats.tents.remainingAllowed === 0 ? 'border-orange-200' : ''
      }`}>
        <Link href="/registration" className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tent Purchases</CardTitle>
            <div className="flex items-center space-x-2">
              {stats.tents.remainingAllowed === 0 ? (
                <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
              ) : (
                <TentIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{stats.tents.purchased}</span>
              <span className="text-sm text-muted-foreground">/ {stats.tents.maxAllowed}</span>
            </div>
            <div className="space-y-1">
              <Progress value={stats.tents.utilizationRate} className="h-2" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {stats.tents.utilizationRate}% utilized
                </span>
                {stats.tents.remainingAllowed > 0 ? (
                  <Badge variant="outline" className="text-xs">
                    {stats.tents.remainingAllowed} available
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    At Limit
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>

      {/* Payment Status Card */}
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
        stats.orders.balanceOwed > 0 ? 'border-orange-200' : ''
      }`}>
        <Link href="/registration" className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <div className="flex items-center space-x-2">
              {stats.orders.balanceOwed > 0 ? (
                <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              )}
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.orders.paidAmount.toLocaleString()}
            </div>
            <div className="space-y-1">
              {stats.orders.balanceOwed > 0 ? (
                <>
                  <p className="text-xs text-orange-600">
                    ${stats.orders.balanceOwed.toLocaleString()} balance owed
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Teams Active
                  </Badge>
                </>
              ) : (
                <p className="text-xs text-green-600">
                  Payments up to date
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {stats.orders.activeEventYear} orders {stats.currentEventYear.year}
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}