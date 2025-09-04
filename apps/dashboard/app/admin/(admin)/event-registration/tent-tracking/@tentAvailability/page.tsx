import * as React from 'react';
import { TentIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';

import { getTentAvailabilitySimple } from '~/actions/admin/get-tent-tracking-simple';

export default async function TentAvailabilityPage(): Promise<React.JSX.Element> {
  const tentAvailability = await getTentAvailabilitySimple();

  if (!tentAvailability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TentIcon className="h-5 w-5" />
            <span>Tent Availability</span>
          </CardTitle>
          <CardDescription>
            No active event year found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No active event year configured. Please set up an event year first.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TentIcon className="h-5 w-5" />
          <span>Tent Availability</span>
        </CardTitle>
        <CardDescription>
          Current tent inventory and utilization for {tentAvailability.eventYearName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tent Utilization</span>
            <span className="text-sm text-muted-foreground">
              {tentAvailability.purchasedTents}/{tentAvailability.totalTents}
            </span>
          </div>
          <Progress value={tentAvailability.utilizationRate} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {tentAvailability.utilizationRate}% utilized
            </span>
            <span className="text-green-600 font-medium">
              {tentAvailability.availableTents} available
            </span>
          </div>

          <div className="grid gap-4 grid-cols-2 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tentAvailability.availableTents}
              </div>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tentAvailability.purchasedTents}
              </div>
              <p className="text-xs text-muted-foreground">Purchased</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
