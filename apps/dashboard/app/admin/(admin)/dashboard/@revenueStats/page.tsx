import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DollarSignIcon } from 'lucide-react';
import { getRevenueStats } from '~/actions/admin/get-revenue-stats';
import { getRevenueProgression } from '~/actions/admin/get-revenue-progression';
import { RevenueProgressionChart } from '~/components/admin/charts/revenue-progression-chart';
import { formatCurrency } from '~/lib/formatters';

export default async function RevenueStatsPage(): Promise<React.JSX.Element> {
  const [stats, progressionData] = await Promise.all([
    getRevenueStats(),
    getRevenueProgression(),
  ]);

  const growthIsPositive = stats.growthRate !== null && stats.growthRate >= 0;
  const growthDisplay = stats.growthRate !== null
    ? `${growthIsPositive ? '+' : ''}${stats.growthRate.toFixed(1)}%`
    : 'N/A';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <DollarSignIcon className="mr-2 h-4 w-4" />
            Revenue Statistics
          </CardTitle>
          <CardDescription>
            Key revenue metrics and growth indicators
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="text-foreground/70">{formatCurrency(stats.registrationRevenue)}</span> registrations
            {stats.sponsorshipRevenue > 0 && (
              <span> · <span className="text-foreground/70">{formatCurrency(stats.sponsorshipRevenue)}</span> sponsorships</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex-1 mb-4">
          <RevenueProgressionChart data={progressionData} />
        </div>
      </CardContent>
    </Card>
  );
}
