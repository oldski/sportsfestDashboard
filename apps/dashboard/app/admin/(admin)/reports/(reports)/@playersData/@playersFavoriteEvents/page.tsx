import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { StarIcon } from 'lucide-react';
import { PieChart } from '~/components/admin/charts/pie-chart';
import { getFavoriteEvents } from '~/actions/admin/get-player-analytics';

export default async function PlayersFavoriteEventsPage(): Promise<React.JSX.Element> {
  const eventsData = await getFavoriteEvents();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <StarIcon className="mr-2 h-3 w-3" />
          Favorite Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={eventsData} height={260} donut />
      </CardContent>
    </Card>
  );
}
