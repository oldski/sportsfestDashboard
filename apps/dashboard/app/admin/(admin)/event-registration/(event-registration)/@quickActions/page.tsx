import * as React from 'react';

import { getRegistrationOrders } from '~/data/registration/get-orders';
import { OrdersDataTable } from '~/components/organizations/slug/registration/orders-data-table';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";

export default async function QuickActionsPage(): Promise<React.JSX.Element> {

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/event-registration/products/create">
            Create Product
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/event-registration/event-years">
            Manage Event Years
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/event-registration/payments/pending">
            Review Pending Payments
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/event-registration/invoices/overdue">
            Process Overdue Invoices
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/event-registration/tent-tracking/report">
            Generate Tent Report
          </Link>
        </Button>
      </div>
    </>
  );
}
