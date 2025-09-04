import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function PaymentManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Pending Deposits</span>
          <span className="font-medium text-orange-600">{stats.pendingPaymentsCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Completed Payments</span>
          <span className="font-medium text-green-600">{stats.completedPaymentsCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Failed Transactions</span>
          <span className="font-medium text-red-600">{stats.failedPaymentsCount}</span>
        </div>
      </div>
    </>
  );
}
