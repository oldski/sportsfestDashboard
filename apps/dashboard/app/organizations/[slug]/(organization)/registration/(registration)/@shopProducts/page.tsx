import * as React from 'react';
import {Badge} from "@workspace/ui/components/badge";
import {Progress} from "@workspace/ui/components/progress";
import {CardDescription} from "@workspace/ui/components/card";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";

export default async function ShopProductsPage(): Promise<React.JSX.Element> {

  //TODO: Add an actual snapshot component
  return(
    <>
      <CardDescription className="mb-4">
        Browse and purchase SportsFest products and services
      </CardDescription>
      <Button asChild className="w-full">
        <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, activeOrganization.slug)}>
          Browse Products
        </Link>
      </Button>
    </>
  )
}
