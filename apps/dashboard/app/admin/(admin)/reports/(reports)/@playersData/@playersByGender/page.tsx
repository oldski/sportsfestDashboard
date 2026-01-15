import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { PieChartIcon } from 'lucide-react';
import { PieChart } from '~/components/admin/charts/pie-chart';
import { getGenderDistribution } from '~/actions/admin/get-player-analytics';

export default async function PlayersByGenderPage(): Promise<React.JSX.Element> {
  const genderData = await getGenderDistribution();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <PieChartIcon className="mr-2 h-3 w-3" />
          Gender Split
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={genderData} height={200} donut />
      </CardContent>
    </Card>
  );
}