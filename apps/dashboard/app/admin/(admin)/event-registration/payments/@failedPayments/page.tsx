import * as React from 'react';

import { Card, CardContent } from '@workspace/ui/components/card';
import { getFailedPaymentsSimple } from '~/actions/admin/get-payments-simple';
import { PaymentsDataTable } from '~/components/admin/event-registration/payments-data-table';

export default async function FailedPaymentsPage(): Promise<React.JSX.Element> {
  const failedPayments = await getFailedPaymentsSimple();

  return (
    <Card className="pb-0">
      <CardContent className="p-0">
        <PaymentsDataTable data={failedPayments} status="failed" />
      </CardContent>
    </Card>
  );
}
