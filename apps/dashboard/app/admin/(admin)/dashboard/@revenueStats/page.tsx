import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DollarSignIcon } from 'lucide-react';
import { getRevenueStats } from '~/actions/admin/get-revenue-stats';
import { getRevenueByCategory } from '~/actions/admin/get-revenue-by-category';
import { RevenueByCategoryChart } from '~/components/admin/charts/revenue-by-category-chart';
import { formatCurrency } from '~/lib/formatters';

export default async function RevenueStatsPage(): Promise<React.JSX.Element> {
  const [stats, categoryData] = await Promise.all([
    getRevenueStats(),
    getRevenueByCategory()
  ]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <DollarSignIcon className="mr-2 h-4 w-4" />
            Revenue Statistics
          </CardTitle>
          <CardDescription>
            Cumulative revenue by category
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <RevenueByCategoryChart data={categoryData.data} />
        </div>
      </CardContent>
    </Card>
  );
}
