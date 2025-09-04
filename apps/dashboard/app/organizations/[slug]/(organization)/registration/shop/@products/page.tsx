import * as React from 'react';

import { getRegistrationProducts } from '~/data/registration/get-products';
import { ProductCards } from '~/components/organizations/slug/registration/product-cards';


type ProductsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductsPage({
  params
}: ProductsPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const products = await getRegistrationProducts(slug);

  return <ProductCards products={products} />;
}
