import * as React from 'react';
import Link from 'next/link';
import {TentIcon, Users} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getOrganizationDashboardStats } from '~/data/organization/get-organization-dashboard-stats';

type TotalTentsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TotalTentsPage({
  params
}: TotalTentsPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const stats = await getOrganizationDashboardStats();

  const { purchased, maxAllowed, utilizationRate } = stats.tents;
  const canPurchaseMore = purchased < maxAllowed;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TentIcon className="h-5 w-5" />
            Tents
          </CardTitle>
          <CardDescription>
            {stats.currentEventYear.name}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row w-full lg:items-center justify-end gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{purchased}</div>
              <p className="text-xs text-muted-foreground">
                of {maxAllowed} purchased
              </p>
            </div>
            {utilizationRate === 100 && (
              <Badge variant="secondary">Full</Badge>
            )}
          </div>

          <Progress value={utilizationRate} className="h-2" />

          { canPurchaseMore && (
            <Button asChild size="sm" variant={canPurchaseMore ? 'default' : 'outline'}>
              <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, slug)}>
                Get a tent
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
