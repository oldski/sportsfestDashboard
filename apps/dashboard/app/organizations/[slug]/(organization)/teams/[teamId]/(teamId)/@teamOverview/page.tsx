import * as React from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';

type TeamOverviewParallelRouteProps = {
  params: Promise<{ slug: string; teamId: string }>;
};

export default async function TeamOverviewParallelRoute({
  params
}: TeamOverviewParallelRouteProps): Promise<React.JSX.Element> {
  const { slug, teamId } = await params;

  const team = await getCompanyTeamById(teamId);

  if (!team) {
    notFound();
  }

  const completionPercentage = (team.memberCount / team.maxMembers) * 100;

  return (
    <>
      {/* Team Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {team.name || `Team ${team.teamNumber}`}
              </CardTitle>
              <CardDescription className="mt-2">
                {team.eventYear.name} • Team #{team.teamNumber}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="hidden text-2xl font-bold">{team.memberCount}/{team.maxMembers}</div>
                <div className="text-2xl font-bold">{team.memberCount}</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="hidden mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Team Roster Progress</span>
              <span>{Math.round(completionPercentage)}% of suggested size</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary rounded-full h-3 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Minimum: 12 players required • Maximum suggested: 20 players • Can exceed if needed
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {team.memberCount >= 12 ? (
              <Button asChild variant="outline">
                <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}/events`}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Event Rosters
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <Users className="h-4 w-4 mr-2" />
                Manage Event Rosters
                <span className="ml-2 text-xs">(Need {12 - team.memberCount} more members)</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
