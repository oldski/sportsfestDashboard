import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function ProductManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  // Handle product data fetch failure
  if (stats.errors.products || stats.totalActiveProducts === null) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            {stats.errors.products || 'Product data unavailable'}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Active Products</span>
          <span className="font-medium">{stats.totalActiveProducts}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Categories</span>
          <span className="font-medium">{stats.totalProductCategories ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Requires Deposits</span>
          <span className="font-medium">{stats.productsRequiringDeposits ?? 0}</span>
        </div>
      </div>
    </>
  );
}
