'use client';

import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { routes } from '@workspace/routes';
import { PageHeader, PagePrimaryBar } from '@workspace/ui/components/page';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { DrawerTrigger } from '@workspace/ui/components/drawer';
import { useShoppingCart } from '~/contexts/shopping-cart-context';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export function ShopPageHeader() {
  const { getItemCount, getDueToday } = useShoppingCart();
  const itemCount = getItemCount();
  const dueToday = getDueToday();

  return (
    <PageHeader>
      <PagePrimaryBar>
        <OrganizationPageTitle
          index={{
            route: routes.dashboard.organizations.slug.registration.Index,
            title: 'Registration'
          }}
          title="Shop"
        />
        {/* Shopping Cart Button - Desktop only */}
        {itemCount > 0 && (
          <div className="hidden lg:block">
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="relative"
              >
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cart</span>
                <Badge variant="secondary" className="ml-2">
                  {itemCount}
                </Badge>
                <span className="hidden md:inline ml-2 text-xs text-muted-foreground">
                  {formatCurrency(dueToday)}
                </span>
              </Button>
            </DrawerTrigger>
          </div>
        )}
      </PagePrimaryBar>
    </PageHeader>
  );
}
