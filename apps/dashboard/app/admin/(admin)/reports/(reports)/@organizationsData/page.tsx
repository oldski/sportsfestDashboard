import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { CreditCardIcon } from 'lucide-react';
import { PaymentPipelineChart } from '~/components/admin/charts/payment-pipeline-chart';
import { getOrganizationStats } from '~/actions/admin/get-organization-stats';

export default async function OrganizationsDataPage(): Promise<React.JSX.Element> {
  const stats = await getOrganizationStats();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Company Payment Pipeline
          </CardTitle>
          <CardDescription>
            Companies at each payment stage
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{stats.activeOrganizations}</p>
          <p className="text-xs text-muted-foreground">Active Companies</p>
        </div>
      </CardHeader>
      <CardContent>
        <PaymentPipelineChart data={stats.byRegistrationStatus} />
      </CardContent>
    </Card>
  );
}
