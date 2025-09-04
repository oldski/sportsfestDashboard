import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function ProductManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span>Active Products</span>
          <span className="font-medium">{stats.totalActiveProducts}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Categories</span>
          <span className="font-medium">{stats.totalProductCategories}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Requires Deposits</span>
          <span className="font-medium">{stats.productsRequiringDeposits}</span>
        </div>
      </div>
    </>
  );
}
