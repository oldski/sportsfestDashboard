import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { DollarSignIcon } from 'lucide-react';

export default function RevenueStatsPage(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <DollarSignIcon className="mr-2 h-4 w-4" />
          Revenue Statistics
        </CardTitle>
        <CardDescription>
          Key revenue metrics and growth indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">$125,340</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
            </div>
          </div>
          <div className="h-32 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-xs text-muted-foreground">Revenue Trend Chart</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}