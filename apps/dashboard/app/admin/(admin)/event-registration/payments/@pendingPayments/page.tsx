import * as React from 'react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { getPendingPaymentsSimple } from '~/actions/admin/get-payments-simple';
import { PaymentsDataTable } from '~/components/admin/event-registration/payments-data-table';

export default async function PendingPaymentsPage(): Promise<React.JSX.Element> {
  const pendingPayments = await getPendingPaymentsSimple();

  return (
    <Card className="pb-0">
      <CardContent className="p-0">
        <PaymentsDataTable data={pendingPayments} status="pending" />
      </CardContent>
    </Card>
  );
}
