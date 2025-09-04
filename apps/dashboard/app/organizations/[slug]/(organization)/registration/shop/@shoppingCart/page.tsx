import * as React from 'react';

import { ShoppingCart } from '~/components/organizations/slug/registration/shopping-cart';
import { FloatingShoppingCart } from '~/components/organizations/slug/registration/floating-shopping-cart';

export default async function ShoppingCartPage(): Promise<React.JSX.Element> {
  return (
    <>
      {/* Desktop Shopping Cart - Sidebar */}
      <ShoppingCart />
      {/* Mobile/Tablet Shopping Cart - Floating */}
      <FloatingShoppingCart />
    </>
  );
}
