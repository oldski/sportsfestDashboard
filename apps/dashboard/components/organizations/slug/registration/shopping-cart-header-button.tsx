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

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

interface ShoppingCartHeaderButtonProps {
  onOpenChange: (open: boolean) => void;
}

export function ShoppingCartHeaderButton({ onOpenChange }: ShoppingCartHeaderButtonProps) {
  const {
    getItemCount,
    getDueToday
  } = useShoppingCart();

  const itemCount = getItemCount();
  const dueToday = getDueToday();

  if (itemCount === 0) {
    return null;
  }

  return (
    <DrawerTrigger asChild>
      <Button
        variant="outline"
        size="default"
        className="relative"
        onClick={() => onOpenChange(true)}
      >
        <ShoppingCartIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Cart</span>
        {itemCount > 0 && (
          <>
            <Badge variant="secondary" className="ml-2">
              {itemCount}
            </Badge>
            <span className="hidden md:inline ml-2 text-xs text-muted-foreground">
              {formatCurrency(dueToday)}
            </span>
          </>
        )}
      </Button>
    </DrawerTrigger>
  );
}
