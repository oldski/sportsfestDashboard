import * as React from 'react';

import { getRegistrationOrders } from '~/data/registration/get-orders';
import { OrdersDataTable } from '~/components/organizations/slug/registration/orders-data-table';

type OrdersTablePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ openOrder?: string }>;
};

export default async function OrdersTablePage({ params, searchParams }: OrdersTablePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const { openOrder } = await searchParams;
  const orders = await getRegistrationOrders(slug);

  return (
    <OrdersDataTable orders={orders} autoOpenOrderId={openOrder} />
  );
}
