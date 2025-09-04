import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function InvoiceManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  return (
    <>
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span>Outstanding Invoices</span>
          <span className="font-medium text-orange-600">{stats.outstandingInvoicesCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Paid This Month</span>
          <span className="font-medium">{stats.paidInvoicesThisMonth}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Overdue</span>
          <span className="font-medium text-red-600">{stats.overdueInvoicesCount}</span>
        </div>
      </div>
    </>
  );
}
