import * as React from 'react';
import {Badge} from "@workspace/ui/components/badge";
import {Progress} from "@workspace/ui/components/progress";
import {CardDescription} from "@workspace/ui/components/card";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";

type ViewOrdersPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ViewOrdersPage({ params }: ViewOrdersPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  //TODO: Add an actual snapshot component
  return(
    <>
      <CardDescription className="mb-4">
        Track your registration orders and payments
      </CardDescription>
      <Button asChild variant="outline" className="w-full">
        <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Orders, slug)}>
          View Orders
        </Link>
      </Button>
    </>
  )
}
