import * as React from 'react';
import { UserPlus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

import { getCompanyTeams } from '~/data/teams/get-company-teams';

export default async function AvailablePlayersParallelRoute(): Promise<React.JSX.Element> {
  const teamsData = await getCompanyTeams();

  // Only show if we have available players and teams exist
  if (teamsData.availablePlayerCount === 0 || teamsData.teams.length === 0) {
    return <></>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Available Players</CardTitle>
        <CardDescription>
          {teamsData.availablePlayerCount} players registered but not assigned to teams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          View Available Players
        </Button>
      </CardContent>
    </Card>
  );
}