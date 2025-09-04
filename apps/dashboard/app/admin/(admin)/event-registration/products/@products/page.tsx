import * as React from 'react';

import { getProducts } from '~/actions/admin/get-products';
import { ProductsDataTable } from '~/components/admin/event-registration/products-data-table';

export default async function ProductTablePage(): Promise<React.JSX.Element> {
  const products = await getProducts();

  return <ProductsDataTable products={products} />;
}
