import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {ArrowRightIcon, CalendarIcon, PackageIcon, ShoppingCartIcon} from "lucide-react";
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
    <div>
      {children}
    </div>
  )
}
