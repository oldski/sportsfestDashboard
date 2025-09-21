import * as React from 'react';

import { getCompanyTeams } from '~/data/teams/get-company-teams';
import { TeamsOverviewCard } from '~/components/teams/teams-overview-card';

export default async function CompanyTeamsOverviewParallelRoute(): Promise<React.JSX.Element> {
  const teamsData = await getCompanyTeams();

  // Only show if we have an active event year and teams
  if (!teamsData.eventYear || teamsData.teams.length === 0) {
    return <></>;
  }

  return (
    <TeamsOverviewCard
      eventYearName={teamsData.eventYear.name}
      teamCount={teamsData.teams.length}
      availablePlayerCount={teamsData.availablePlayerCount}
    />
  );
}