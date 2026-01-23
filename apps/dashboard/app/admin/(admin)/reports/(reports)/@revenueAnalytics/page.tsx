import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DollarSignIcon } from 'lucide-react';
import { RevenueByProductChart } from '~/components/admin/charts/revenue-by-product-chart';
import { getRevenueAnalytics } from '~/actions/admin/get-revenue-analytics';
import { formatCurrency } from '~/lib/formatters';

export default async function RevenueAnalyticsPage(): Promise<React.JSX.Element> {
  const { byProductType, netRevenue } = await getRevenueAnalytics();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <DollarSignIcon className="mr-2 h-4 w-4" />
            Revenue by Type
          </CardTitle>
          <CardDescription>
            Revenue breakdown by product type and sponsorships
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(netRevenue)}</p>
          <p className="text-xs text-muted-foreground">Net Revenue</p>
        </div>
      </CardHeader>
      <CardContent>
        <RevenueByProductChart data={byProductType} />
      </CardContent>
    </Card>
  );
}
