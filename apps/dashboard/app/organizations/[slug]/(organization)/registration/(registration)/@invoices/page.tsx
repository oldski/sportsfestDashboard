import * as React from 'react';
import {Badge} from "@workspace/ui/components/badge";
import {Progress} from "@workspace/ui/components/progress";
import {CardDescription} from "@workspace/ui/components/card";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";

export default async function InvoicesPage(): Promise<React.JSX.Element> {

  //TODO: Add an actual snapshot component
  return(
    <>
      <CardDescription className="mb-4">
        View and manage your payment invoices
      </CardDescription>
      <Button asChild variant="outline" className="w-full">
        <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Invoices, activeOrganization.slug)}>
          View Invoices
        </Link>
      </Button>
    </>
  )
}
