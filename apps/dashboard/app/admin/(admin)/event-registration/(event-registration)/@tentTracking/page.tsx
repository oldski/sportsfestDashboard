import * as React from 'react';
import { TentIcon } from 'lucide-react';

import { getAdminOverviewStats } from '~/actions/admin/get-admin-overview-stats';

export default async function TentTrackingPage(): Promise<React.JSX.Element> {
  const stats = await getAdminOverviewStats();

  // Calculate inventory metrics for better display
  const totalInventory = stats.totalTentRentals + stats.availableTents; // Rough estimate
  const utilizationPercent = stats.tentUtilizationRate;

  return (
    <div className="space-y-4">
      {/* Main tent rental count */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <TentIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Tent Rentals</span>
        </div>
        <div className="text-3xl font-bold">{stats.totalTentRentals}</div>
        <div className="text-xs text-muted-foreground">
          {utilizationPercent}% utilization rate
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Inventory</span>
          <span className="font-medium">{totalInventory || '400'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tents Sold</span>
          <span className="font-medium">{stats.totalTentRentals}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available</span>
          <span className="font-medium text-green-600">{stats.availableTents}</span>
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
