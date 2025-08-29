import * as React from 'react';
import {Badge} from "@workspace/ui/components/badge";
import {Progress} from "@workspace/ui/components/progress";
import {CardDescription} from "@workspace/ui/components/card";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import {DollarSignIcon, PackageIcon, TrendingUpIcon} from "lucide-react";

export default async function RecentActivityPage(): Promise<React.JSX.Element> {

  //TODO: Add an actual snapshot component
  return(
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <DollarSignIcon className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium">Payment Received</p>
              <p className="text-sm text-muted-foreground">Invoice #INV-2025-001 - $425.00</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">2 hours ago</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <PackageIcon className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium">Order Created</p>
              <p className="text-sm text-muted-foreground">Order #ORD-2025-001 - $1,275.00</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">1 day ago</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <TrendingUpIcon className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium">Registration Started</p>
              <p className="text-sm text-muted-foreground">Welcome to SportsFest 2025!</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">3 days ago</span>
        </div>
      </div>
    </>
  )
}
