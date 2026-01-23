import * as React from 'react';

import { Card, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { ClockIcon } from 'lucide-react';
import { getOrdersWithOutstandingBalance } from '~/actions/admin/get-orders-with-balance';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import { OrdersWithBalanceDataTable } from '~/components/admin/event-registration/orders-with-balance-data-table';

export default async function PendingPaymentsPage(): Promise<React.JSX.Element> {
  const [ordersWithBalance, currentEventYear] = await Promise.all([
    getOrdersWithOutstandingBalance(),
    getCurrentEventYear()
  ]);

  if (!currentEventYear) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClockIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">No Active Event Year</CardTitle>
          <CardDescription>
            Set an active event year to view pending payments
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <OrdersWithBalanceDataTable data={ordersWithBalance} />
  );
}
