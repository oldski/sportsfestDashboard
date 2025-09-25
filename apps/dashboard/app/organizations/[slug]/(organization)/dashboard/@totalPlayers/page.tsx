import * as React from 'react';
import Link from 'next/link';
import {TentIcon, UsersIcon} from 'lucide-react';

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
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Players
          </CardTitle>
          <CardDescription>
            {stats.currentEventYear.name}
          </CardDescription>
        </div>
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
              View All Players
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
