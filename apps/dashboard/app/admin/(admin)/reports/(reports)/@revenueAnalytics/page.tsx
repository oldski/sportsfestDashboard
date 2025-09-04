import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DollarSignIcon } from 'lucide-react';
import { RevenueWaterfallChart } from '~/components/admin/charts/revenue-waterfall-chart';
import { getRevenueAnalytics } from '~/actions/admin/get-revenue-analytics';

export default async function RevenueAnalyticsPage(): Promise<React.JSX.Element> {
  const revenueData = await getRevenueAnalytics();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <DollarSignIcon className="mr-2 h-4 w-4" />
          Revenue Analytics
        </CardTitle>
        <CardDescription>
          Revenue waterfall showing income sources and deductions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RevenueWaterfallChart data={revenueData} />
      </CardContent>
    </Card>
  );
}