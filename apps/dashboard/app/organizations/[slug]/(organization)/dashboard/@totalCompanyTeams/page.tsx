import * as React from 'react';
import Link from 'next/link';
import {TrophyIcon, UsersIcon, VolleyballIcon} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

type TotalCompanyTeamsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TotalCompanyTeamsPage({
  params
}: TotalCompanyTeamsPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const stats = await getOrganizationDashboardStats();

  const hasTeams = stats.teams.activeEventYear > 0;
  const teamCount = stats.teams.activeEventYear;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5" />
            Company Teams
          </CardTitle>
          <CardDescription>
            {stats.currentEventYear.name}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex h-full items-end">
        <div className="flex flex-col lg:flex-row w-full lg:items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold">{teamCount}</div>
            <p className="text-xs text-muted-foreground">
              {teamCount === 1 ? 'Team registered' : 'Teams registered'}
            </p>
          </div>
          <Button asChild size="sm" variant={hasTeams ? 'outline' : 'default'}>
            <Link href={replaceOrgSlug(
              hasTeams
                ? routes.dashboard.organizations.slug.Teams
                : routes.dashboard.organizations.slug.registration.Shop,
              slug
            )}>
              {hasTeams ? 'Manage Rosters' : 'Register'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
