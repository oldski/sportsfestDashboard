import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function PaymentManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  // Handle payment data fetch failure
  if (stats.errors.payments || stats.pendingPaymentsCount === null) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            {stats.errors.payments || 'Payment data unavailable'}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Pending Deposits</span>
          <span className="font-medium text-orange-600">{stats.pendingPaymentsCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Completed Payments</span>
          <span className="font-medium text-green-600">{stats.completedPaymentsCount ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Failed Transactions</span>
          <span className="font-medium text-red-600">{stats.failedPaymentsCount ?? 0}</span>
        </div>
      </div>
    </>
  );
}
