import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function InvoiceManagementPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  // Handle invoice data fetch failure
  if (stats.errors.invoices || stats.outstandingInvoicesCount === null) {
    return (
      <>
        <div className="flex items-center gap-2 py-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            {stats.errors.invoices || 'Invoice data unavailable'}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Outstanding Invoices</span>
          <span className="font-medium text-orange-600">{stats.outstandingInvoicesCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Paid This Month</span>
          <span className="font-medium">{stats.paidInvoicesThisMonth ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Overdue</span>
          <span className="font-medium text-red-600">{stats.overdueInvoicesCount ?? 0}</span>
        </div>
      </div>
    </>
  );
}
