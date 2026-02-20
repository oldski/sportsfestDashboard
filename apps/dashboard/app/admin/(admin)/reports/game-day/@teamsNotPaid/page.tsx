import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { CircleAlertIcon } from 'lucide-react';
import { TeamsDepositPaidTable } from '~/components/admin/tables/teams-deposit-paid-table';
import { getTeamsByPaymentStatus } from '~/actions/admin/get-teams-by-payment-status';
import { formatCurrency } from '~/lib/formatters';

export default async function TeamsNotPaidPage(): Promise<React.JSX.Element> {
  const data = await getTeamsByPaymentStatus('DEPOSIT_PAID');

  const totalBalanceOwed = data.rows.reduce((sum, r) => sum + r.balanceOwed, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <CircleAlertIcon className="mr-2 h-4 w-4 text-amber-600" />
            Teams Deposit Paid
          </CardTitle>
          <CardDescription>
            Orders with deposit paid, balance remaining
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{data.totalTeams}</p>
          <p className="text-xs text-amber-600 font-medium">{data.totalOrders} orders / {formatCurrency(totalBalanceOwed)} owed</p>
        </div>
      </CardHeader>
      <CardContent>
        <TeamsDepositPaidTable data={data.rows} />
      </CardContent>
    </Card>
  );
}
