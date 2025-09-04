import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';
import { formatCurrency } from '~/lib/formatters';

export default async function TotalRevenuePage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();
  const growthSign = stats.revenueGrowthPercent >= 0 ? '+' : '';

  return (
    <>
      <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
      <p className="text-xs text-muted-foreground">
        {growthSign}{stats.revenueGrowthPercent}% from last month
      </p>
    </>
  );
}
