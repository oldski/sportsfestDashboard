import * as React from 'react';

import { ShoppingCartDrawer } from '~/components/organizations/slug/registration/shopping-cart-drawer';

export default async function ShoppingCartPage(): Promise<React.JSX.Element> {
  return (
    <>
      {/* Shopping Cart - Drawer for all screen sizes */}
      <ShoppingCartDrawer />
    </>
  );
}
