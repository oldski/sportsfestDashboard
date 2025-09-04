import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function ActiveProductsPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="text-2xl font-bold">{stats.totalActiveProducts}</div>
      <p className="text-xs text-muted-foreground">
        +{stats.productsAddedThisMonth} added this month
      </p>
    </>
  );
}
