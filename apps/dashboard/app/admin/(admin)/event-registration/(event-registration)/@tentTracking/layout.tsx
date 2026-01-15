import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {ArrowRightIcon, CalendarIcon, PackageIcon, ShoppingCartIcon, TentIcon} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import TentTrackingPage from "~/app/organizations/[slug]/(organization)/registration/(registration)/@shopProducts/page";

export default function TentTrackingLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card className="flex flex-col cursor-pointer hover:shadow-md transition-shadow">
      <Link href="/admin/event-registration/tent-tracking" className="flex flex-col flex-1">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TentIcon className="h-5 w-5 text-primary" />
            <CardTitle>Tent Tracking</CardTitle>
          </div>
          <CardDescription>
            Monitor tent purchases and enforce 2-tent limit per organization
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {children}
        </CardContent>
      </Link>
    </Card>
  )
}
