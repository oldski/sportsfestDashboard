import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <DollarSignIcon className="mr-2 h-4 w-4" />
          Revenue Statistics
        </CardTitle>
        <CardDescription>
          Key revenue metrics and growth indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex-1 mb-4">
          <RevenueProgressionChart data={progressionData} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Total Revenue {stats.currentYear ? `(${stats.currentYear})` : ''}
            </p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              YoY Growth {stats.priorYear ? `vs ${stats.priorYear}` : ''}
            </p>
            <div className="flex items-center gap-1">
              {stats.growthRate !== null && (
                growthIsPositive
                  ? <TrendingUpIcon className="h-5 w-5 text-green-600" />
                  : <TrendingDownIcon className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${
                stats.growthRate === null
                  ? 'text-muted-foreground'
                  : growthIsPositive
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}>
                {growthDisplay}
              </p>
            </div>
          </div>
        </div>
        {stats.priorYearRevenue !== null && (
          <div className="pt-2 border-t mt-4">
            <p className="text-xs text-muted-foreground">
              Prior Year Revenue ({stats.priorYear}): {formatCurrency(stats.priorYearRevenue)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
