import * as React from 'react';

import { Progress } from '@workspace/ui/components/progress';

import { getAdminOverviewStats } from '~/actions/admin/get-admin-overview-stats';

export default async function TentTrackingPage(): Promise<React.JSX.Element> {
  const stats = await getAdminOverviewStats();

  // Calculate inventory metrics for better display
  const totalInventory = stats.totalTentRentals + stats.availableTents;
  const utilizationPercent = stats.tentUtilizationRate;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main content - spread vertically */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Main tent rental count */}
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.totalTentRentals}</div>
          <p className="text-sm text-muted-foreground">tents sold</p>
        </div>

        {/* Progress bar - full width */}
        <div className="space-y-2">
          <Progress value={utilizationPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{utilizationPercent}% utilized</span>
            <span>{stats.totalTentRentals}/{totalInventory}</span>
          </div>
        </div>

        {/* Available/Purchased grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.availableTents}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTentRentals}</div>
            <p className="text-xs text-muted-foreground">Purchased</p>
          </div>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Inventory</span>
          <span className="font-medium">{totalInventory || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Orgs at Quota</span>
          <span className="font-medium text-orange-600">{stats.tentQuotaMet}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Orders</span>
          <span className="font-medium">{stats.totalTentPurchases}</span>
        </div>
      </div>
    </div>
  );
}
