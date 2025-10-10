import * as React from 'react';
import { notFound } from 'next/navigation';

import { Separator } from '@workspace/ui/components/separator';

import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';
import { TeamSidebarCollapsible } from '~/components/teams/team-sidebar-collapsible';

type TeamSidebarParallelRouteProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamSidebarParallelRoute({
  params
}: TeamSidebarParallelRouteProps): Promise<React.JSX.Element> {
  const { teamId } = await params;

  const team = await getCompanyTeamById(teamId);

  if (!team) {
    notFound();
  }

  const statsContent = (
    <>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Total Members</span>
        <span className="font-medium">{team.memberCount}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Minimum Required</span>
        <span className="font-medium text-red-600">12</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Suggested Maximum</span>
        <span className="font-medium">{team.maxMembers}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Status</span>
        <span className={`font-medium ${team.memberCount >= 12 ? 'text-green-600' : 'text-red-600'}`}>
          {team.memberCount >= 12 ? 'Ready' : `Need ${12 - team.memberCount} more`}
        </span>
      </div>
      <Separator />
      <div className="flex justify-between">
        <span className="text-muted-foreground">Male Players</span>
        <span className="font-medium">
          {team.members.filter(m => m.gender === 'male').length}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Female Players</span>
        <span className="font-medium">
          {team.members.filter(m => m.gender === 'female').length}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Captains</span>
        <span className={`font-medium ${team.members.filter(m => m.isCaptain).length === 0 ? 'text-red-600' : 'text-green-600'}`}>
          {team.members.filter(m => m.isCaptain).length === 0 ? 'None (Required)' : team.members.filter(m => m.isCaptain).length}
        </span>
      </div>
    </>
  );

  return (
    <TeamSidebarCollapsible>
      {statsContent}
    </TeamSidebarCollapsible>
  );
}
