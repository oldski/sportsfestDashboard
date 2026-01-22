import * as React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";
import {UsersIcon} from "lucide-react";
import { getTotalPlayerCount } from '~/actions/admin/get-player-analytics';

interface PlayersDataLayoutProps {
  playersByAgeGroup: React.ReactNode;
  playersByGender: React.ReactNode;
  playersFavoriteEvents: React.ReactNode;
}

export default async function PlayersDataLayout({
  playersByAgeGroup,
  playersByGender,
  playersFavoriteEvents,
  children
}: PlayersDataLayoutProps & React.PropsWithChildren): Promise<React.JSX.Element> {
  const { count, eventYearName } = await getTotalPlayerCount();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base flex items-center">
              <UsersIcon className="mr-2 h-4 w-4" />
              Player Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive player demographics and activity analysis{eventYearName ? ` (${eventYearName})` : ''}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Players</p>
          </div>
        </CardHeader>
        <CardContent>
        {children}

        {/* Players Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playersByAgeGroup}
          {playersByGender}
          {playersFavoriteEvents}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
