import * as React from 'react';

import { getProductCategories } from '~/actions/admin/get-product-categories';
import { ProductCategoriesGrid } from '~/components/admin/event-registration/product-categories-grid';

export default async function CategoriesPage(): Promise<React.JSX.Element> {
  const categories = await getProductCategories();

  return <ProductCategoriesGrid categories={categories} />;
}