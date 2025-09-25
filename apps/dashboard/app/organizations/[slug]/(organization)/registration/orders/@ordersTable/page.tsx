import * as React from 'react';

import { getRegistrationOrders } from '~/data/registration/get-orders';
import { getOrganizationBySlug } from '~/data/organization/get-organization-by-slug';
import { OrdersDataTable } from '~/components/organizations/slug/registration/orders-data-table';
import { notFound } from 'next/navigation';

type OrdersTablePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ openOrder?: string }>;
};

export default async function OrdersTablePage({ params, searchParams }: OrdersTablePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const { openOrder } = await searchParams;

  const [orders, organization] = await Promise.all([
    getRegistrationOrders(slug),
    getOrganizationBySlug(slug)
  ]);

  if (!organization) {
    notFound();
  }

  return (
    <OrdersDataTable
      orders={orders}
      autoOpenOrderId={openOrder}
      organizationName={organization.name}
    />
  );
}
