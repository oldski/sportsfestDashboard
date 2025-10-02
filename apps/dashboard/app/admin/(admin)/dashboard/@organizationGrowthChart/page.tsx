import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {BuildingIcon, TrendingUpIcon} from "lucide-react";
import { OrganizationGrowthChart } from "~/components/admin/charts/organization-growth-chart";
import { getOrganizationGrowth } from "~/actions/admin/get-organization-growth";
import * as React from "react";

export default async function OrganizationGrowthChartPage(): Promise<React.JSX.Element> {
  const data = await getOrganizationGrowth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5" />
          Company Account Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OrganizationGrowthChart data={data} />
      </CardContent>
    </Card>
  );
}
