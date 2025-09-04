import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {AlertTriangleIcon, ArrowRightIcon, CalendarIcon, PackageIcon, ShoppingCartIcon} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import SystemAlertsPage from "~/app/organizations/[slug]/(organization)/registration/(registration)/@shopProducts/page";

export default function SystemAlertsLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
          <CardTitle>System Alerts</CardTitle>
        </div>
        <CardDescription>
          Important notifications and system status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
