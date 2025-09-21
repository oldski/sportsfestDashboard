import * as React from 'react';
import { notFound } from 'next/navigation';

import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';
import { getPlayersForRosterManagement } from '~/data/teams/get-players-for-roster-management';
import { TeamRosterDisplay } from '~/components/teams/team-roster-display';

type TeamRosterParallelRouteProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamRosterParallelRoute({
  params
}: TeamRosterParallelRouteProps): Promise<React.JSX.Element> {
  const { teamId } = await params;

  const [team, playersData] = await Promise.all([
    getCompanyTeamById(teamId),
    getPlayersForRosterManagement(teamId)
  ]);

  if (!team) {
    notFound();
  }

  return (
    <TeamRosterDisplay team={team} playersData={playersData} />
  );
}