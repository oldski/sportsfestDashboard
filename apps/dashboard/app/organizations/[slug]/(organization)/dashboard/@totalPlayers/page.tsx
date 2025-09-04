import * as React from 'react';
import Link from 'next/link';
import { UsersIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

type TotalPlayersPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TotalPlayersPage({ 
  params 
}: TotalPlayersPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const stats = await getOrganizationDashboardStats();

  const playerCount = stats.players.activeEventYear;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">Players</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {stats.currentEventYear.name}
          </CardDescription>
        </div>
        <UsersIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex h-full items-end">
        <div className="flex w-full items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{playerCount}</div>
            <p className="text-xs text-muted-foreground">
              {playerCount === 1 ? 'Player registered' : 'Players registered'}
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.Players, slug)}>
              View All
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}