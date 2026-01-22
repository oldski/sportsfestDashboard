import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { BarChart3Icon } from 'lucide-react';
import { PieChart } from '~/components/admin/charts/pie-chart';
import { getAgeDistribution } from '~/actions/admin/get-player-analytics';

export default async function PlayersByAgeGroupPage(): Promise<React.JSX.Element> {
  const ageData = await getAgeDistribution();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <BarChart3Icon className="mr-2 h-3 w-3" />
          Age Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={ageData} height={260} donut />
      </CardContent>
    </Card>
  );
}