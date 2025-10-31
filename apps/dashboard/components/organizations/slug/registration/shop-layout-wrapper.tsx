'use client';

import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Drawer,
  DrawerTrigger
} from '@workspace/ui/components/drawer';
import { useShoppingCart } from '~/contexts/shopping-cart-context';
import { ShoppingCartDrawer } from './shopping-cart-drawer';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export function ShopLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const { getItemCount, getDueToday } = useShoppingCart();

  const itemCount = getItemCount();
  const dueToday = getDueToday();

  return (
    <>
      {/* Render cart button in header using React context */}
      {children}

      {/* Shopping Cart Drawer with both header and floating buttons */}
      <ShoppingCartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
