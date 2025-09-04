import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { DollarSignIcon } from "lucide-react";
import { RevenueByTypeChart } from "~/components/admin/charts/revenue-by-type-chart";
import { getRevenueByType } from "~/actions/admin/get-revenue-by-type";
import * as React from "react";

export default async function RevenueByTypeChartPage(): Promise<React.JSX.Element> {
  const data = await getRevenueByType();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <DollarSignIcon className="mr-2 h-4 w-4" />
          Revenue by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <RevenueByTypeChart data={data} />
        ) : (
          <p className="text-sm text-muted-foreground">No revenue data available</p>
        )}
      </CardContent>
    </Card>
  );
}
