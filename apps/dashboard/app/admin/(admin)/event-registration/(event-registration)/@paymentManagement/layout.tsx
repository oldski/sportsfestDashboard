import * as React from 'react';
import {CardHeader, CardTitle, CardContent, CardDescription, Card} from "@workspace/ui/components/card";
import {ArrowRightIcon, CalendarIcon, CreditCardIcon, PackageIcon, ShoppingCartIcon} from "lucide-react";
import {Badge} from "@workspace/ui/components/badge";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";
import PaymentManagementPage from "~/app/organizations/[slug]/(organization)/registration/(registration)/@shopProducts/page";

export default function PaymentManagementLayout({
  children
}: React.PropsWithChildren): React.JSX.Element {
  // TODO: more of a ux component
  return(
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <Link href="/admin/event-registration/payments" className="block">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            <CardTitle>Payment Management</CardTitle>
          </div>
          <CardDescription>
            Track deposits, balance payments, and Stripe transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          {children}
        </CardContent>
      </Link>
    </Card>
  )
}
