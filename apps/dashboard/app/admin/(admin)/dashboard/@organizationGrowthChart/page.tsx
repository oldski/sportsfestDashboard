import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { TrendingUpIcon } from "lucide-react";
import { OrganizationGrowthChart } from "~/components/admin/charts/organization-growth-chart";
import { getOrganizationGrowth } from "~/actions/admin/get-organization-growth";
import * as React from "react";

export default async function OrganizationGrowthChartPage(): Promise<React.JSX.Element> {
  const data = await getOrganizationGrowth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <TrendingUpIcon className="mr-2 h-4 w-4" />
          Organization Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OrganizationGrowthChart data={data} />
      </CardContent>
    </Card>
  );
}
