import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { XCircleIcon } from 'lucide-react';
import { getFailedPaymentsSimple } from '~/actions/admin/get-payments-simple';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import { PaymentsDataTable } from '~/components/admin/event-registration/payments-data-table';

export default async function FailedPaymentsPage(): Promise<React.JSX.Element> {
  const [failedPayments, currentEventYear] = await Promise.all([
    getFailedPaymentsSimple(),
    getCurrentEventYear()
  ]);

  if (!currentEventYear) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <XCircleIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">No Active Event Year</CardTitle>
          <CardDescription>
            Set an active event year to view failed payments
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PaymentsDataTable data={failedPayments} status="failed" />
  );
}
