import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { UsersIcon } from 'lucide-react';
import { TopCompaniesByPlayersChart } from '~/components/admin/charts/top-companies-by-players-chart';
import { getTopCompaniesByPlayers } from '~/actions/admin/get-top-companies-by-players';

export default async function TopCompaniesByPlayersPage(): Promise<React.JSX.Element> {
  const playerData = await getTopCompaniesByPlayers();

  const totalPlayers = playerData.reduce((sum, company) => sum + company.playerCount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center">
            <UsersIcon className="mr-2 h-4 w-4" />
            Top Companies by Player Count
          </CardTitle>
          <CardDescription>
            Companies with the most registered players
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalPlayers.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Top 10 Total</p>
        </div>
      </CardHeader>
      <CardContent>
        <TopCompaniesByPlayersChart data={playerData} />
      </CardContent>
    </Card>
  );
}
