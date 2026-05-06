import * as React from 'react';

import { getProducts } from '~/actions/admin/get-products';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import { ProductsDataTable } from '~/components/admin/event-registration/products-data-table';

export default async function ProductTablePage(): Promise<React.JSX.Element> {
  const [products, activeEventYear] = await Promise.all([
    getProducts(),
    getCurrentEventYear()
  ]);

  const activeEventYearId = (activeEventYear?.id as string | undefined) ?? null;

  return (
    <ProductsDataTable
      products={products}
      activeEventYearId={activeEventYearId}
    />
  );
}
