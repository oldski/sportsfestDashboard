import * as React from 'react';
import { AlertCircle } from 'lucide-react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import { formatCurrency } from '~/lib/formatters';

export default async function PendingPaymentsPage(): Promise<React.JSX.Element> {
  const [stats, currentEventYear] = await Promise.all([
    getEventRegistrationStats(),
    getCurrentEventYear()
  ]);

  if (!currentEventYear) {
    return (
      <>
        <div className="text-2xl font-bold text-muted-foreground">--</div>
        <p className="text-xs text-muted-foreground">
          No active event year
        </p>
      </>
    );
  }

  // Handle payment data fetch failure
  if (stats.errors.payments || stats.totalPendingPayments === null) {
    return (
      <>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-lg font-medium text-muted-foreground">Unable to load</span>
        </div>
        <p className="text-xs text-destructive">
          {stats.errors.payments || 'Payment data unavailable'}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-2xl font-bold">{formatCurrency(stats.totalPendingPayments)}</div>
      <p className="text-xs text-muted-foreground">
        {stats.pendingPaymentsCount} {stats.pendingPaymentsCount === 1 ? 'payment' : 'payments'} awaiting balance
      </p>
    </>
  );
}
