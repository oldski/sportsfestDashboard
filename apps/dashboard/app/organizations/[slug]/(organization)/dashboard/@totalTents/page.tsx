import * as React from 'react';
import Link from 'next/link';
import { TentIcon } from 'lucide-react';

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
          <CardTitle className="text-sm font-medium">Tents</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {stats.currentEventYear.name}
          </CardDescription>
        </div>
        <TentIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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
          
          <Button asChild size="sm" variant={canPurchaseMore ? 'default' : 'outline'}>
            <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, slug)}>
              {canPurchaseMore ? 'Add More' : 'View Shop'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}