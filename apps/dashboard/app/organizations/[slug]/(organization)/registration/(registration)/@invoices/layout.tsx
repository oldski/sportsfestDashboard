import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {ArrowRightIcon, CalendarIcon, FileTextIcon, ShoppingCartIcon} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import InvoicesPage from "~/app/organizations/[slug]/(organization)/registration/(registration)/@shopProducts/page";

export default function InvoicesLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileTextIcon className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Invoices</CardTitle>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
