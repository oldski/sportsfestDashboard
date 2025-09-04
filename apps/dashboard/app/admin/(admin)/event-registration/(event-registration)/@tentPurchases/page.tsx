import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function TentPurchasesPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="text-2xl font-bold">{stats.tentQuotaMet}/{stats.totalTentPurchases}</div>
      <p className="text-xs text-muted-foreground">
        {stats.tentUtilizationPercent}% utilization rate
      </p>
    </>
  );
}
