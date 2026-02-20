import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { CircleCheckIcon } from 'lucide-react';
import { TeamsPaidFullyTable } from '~/components/admin/tables/teams-paid-fully-table';
import { getTeamsByPaymentStatus } from '~/actions/admin/get-teams-by-payment-status';
import { formatCurrency } from '~/lib/formatters';

export default async function TeamsPaidFullyPage(): Promise<React.JSX.Element> {
  const data = await getTeamsByPaymentStatus('FULLY_PAID');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <CircleCheckIcon className="mr-2 h-4 w-4 text-green-600" />
            Teams Fully Paid
          </CardTitle>
          <CardDescription>
            Orders with full payment received
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{data.totalTeams}</p>
          <p className="text-xs text-muted-foreground">{data.totalOrders} orders / {formatCurrency(data.totalAmount)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <TeamsPaidFullyTable data={data.rows} />
      </CardContent>
    </Card>
  );
}
