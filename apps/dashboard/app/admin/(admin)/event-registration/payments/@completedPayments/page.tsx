import * as React from 'react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { getCompletedPaymentsSimple } from '~/actions/admin/get-payments-simple';
import { PaymentsDataTable } from '~/components/admin/event-registration/payments-data-table';

export default async function CompletedPaymentsPage(): Promise<React.JSX.Element> {
  const completedPayments = await getCompletedPaymentsSimple();

  return (
    <Card className="pb-0">
      <CardContent className="p-0">
        <PaymentsDataTable data={completedPayments} status="completed" />
      </CardContent>
    </Card>
  );
}
