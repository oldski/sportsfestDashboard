import * as React from 'react';

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

  return (
    <>
      <div className="text-2xl font-bold">{formatCurrency(stats.totalPendingPayments)}</div>
      <p className="text-xs text-muted-foreground">
        {stats.pendingPaymentsCount} {stats.pendingPaymentsCount === 1 ? 'payment' : 'payments'} awaiting balance
      </p>
    </>
  );
}
