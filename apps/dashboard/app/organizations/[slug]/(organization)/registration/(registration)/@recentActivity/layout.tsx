import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingCartIcon,
  TrendingUpIcon
} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import RecentActivityPage from "~/app/organizations/[slug]/(organization)/registration/(registration)/@shopProducts/page";

export default function RecentActivityLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
