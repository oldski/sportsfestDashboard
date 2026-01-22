import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { BuildingIcon } from 'lucide-react';
import { OrganizationPerformanceChart } from '~/components/admin/charts/organization-performance-chart';
import { getOrganizationPerformance } from '~/actions/admin/get-organization-performance';

export default async function OrganizationPerformancePage(): Promise<React.JSX.Element> {
  const performanceData = await getOrganizationPerformance();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <BuildingIcon className="mr-2 h-4 w-4" />
          Top Companies by Revenue
        </CardTitle>
        <CardDescription>
          Revenue breakdown by company and category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OrganizationPerformanceChart data={performanceData} />
      </CardContent>
    </Card>
  );
}
