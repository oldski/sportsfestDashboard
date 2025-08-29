import * as React from 'react';
import {Badge} from "@workspace/ui/components/badge";
import {Progress} from "@workspace/ui/components/progress";

export default async function SnapshotPage(): Promise<React.JSX.Element> {

  //TODO: Add an actual snapshot component
  return(
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600">$1,375.00</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Balance Owed</p>
          <p className="text-2xl font-bold text-orange-600">$850.00</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Registration Status</p>
          <Badge variant="secondary" className="mt-1">Partial Payment</Badge>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Registration Progress</span>
          <span>62% Complete</span>
        </div>
        <Progress value={62} className="h-2" />
      </div>
    </>
  )
}
