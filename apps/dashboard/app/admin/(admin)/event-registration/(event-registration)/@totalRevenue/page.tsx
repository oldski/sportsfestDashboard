import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';
import { formatCurrency } from '~/lib/formatters';

export default async function TotalRevenuePage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  // Handle revenue data fetch failure
  if (stats.errors.revenue || stats.totalRevenue === null) {
    return (
      <>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-lg font-medium text-muted-foreground">Unable to load</span>
        </div>
        <p className="text-xs text-destructive">
          {stats.errors.revenue || 'Revenue data unavailable'}
        </p>
      </>
    );
  }

  const growthSign = (stats.revenueGrowthPercent ?? 0) >= 0 ? '+' : '';

  return (
    <>
      <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
      <p className="text-xs text-muted-foreground">
        {growthSign}{stats.revenueGrowthPercent ?? 0}% from last month
      </p>
    </>
  );
}
