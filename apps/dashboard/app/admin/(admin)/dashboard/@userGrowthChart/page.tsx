import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {TrendingUpIcon, UsersIcon} from "lucide-react";
import { UserGrowthChart } from "~/components/admin/charts/user-growth-chart";
import { getUserGrowth } from "~/actions/admin/get-user-growth";
import * as React from "react";

export default async function UserGrowthChartPage(): Promise<React.JSX.Element> {
  const data = await getUserGrowth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          User Account Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserGrowthChart data={data} />
      </CardContent>
    </Card>
  );
}
