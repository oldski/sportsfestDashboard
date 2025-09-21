import * as React from 'react';
import Link from 'next/link';
import { Users, Crown } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getCompanyTeams } from '~/data/teams/get-company-teams';

type TeamsParallelRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function TeamsParallelRoute({
  params
}: TeamsParallelRouteProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  const teamsData = await getCompanyTeams();

  if (teamsData.teams.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Teams Purchased</h2>
            <p className="text-muted-foreground mb-4">
              You need to purchase company teams before you can create rosters.
            </p>
            <Button asChild>
              <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, slug)}>
                Purchase Teams
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {teamsData.teams.map((team) => (
        <Card key={team.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {team.name || `Team ${team.teamNumber}`}
              </CardTitle>
            </div>
            <CardDescription>
              {team.memberCount}/{team.maxMembers} members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(team.memberCount / team.maxMembers) * 100}%` }}
              />
            </div>

            {/* Team Members */}
            {team.members.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Team Members</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.isCaptain && (
                        <Crown className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players assigned</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}`}>
                  Manage Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}