import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { UsersIcon } from "lucide-react";
import { UserGrowthChart } from "~/components/admin/charts/user-growth-chart";
import { getUserGrowth } from "~/actions/admin/get-user-growth";
import * as React from "react";

export default async function UserGrowthChartPage(): Promise<React.JSX.Element> {
  const data = await getUserGrowth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <UsersIcon className="mr-2 h-4 w-4" />
          User Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserGrowthChart data={data} />
      </CardContent>
    </Card>
  );
}
