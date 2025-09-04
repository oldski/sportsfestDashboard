'use client';

import * as React from 'react';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  CreditCardIcon,
  XIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';

import { useShoppingCart } from '~/contexts/shopping-cart-context';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export function ShoppingCart() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getItemCount,
    getSubtotal,
    getTotalDeposit,
    getFuturePayments,
    getCartTotal
  } = useShoppingCart();

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const totalDeposit = getTotalDeposit();
  const futurePayments = getFuturePayments();
  const cartTotal = getCartTotal();

  if (items.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCartIcon className="size-5" />
            <span>Shopping Cart</span>
          </CardTitle>
          <CardDescription>
            Your cart is empty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCartIcon className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Add products to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCartIcon className="size-5" />
            <span>Shopping Cart</span>
            <Badge variant="secondary">{itemCount} item{itemCount !== 1 ? 's' : ''}</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <TrashIcon className="size-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.useDeposit}`} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-tight">{item.product.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.product.category.name}
                  </Badge>
                  {item.useDeposit && (
                    <Badge variant="secondary" className="text-xs">
                      Deposit Only
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(item.unitPrice)} each
                  {item.useDeposit && item.product.requiresDeposit && (
                    <span className="block">
                      Balance: {formatCurrency((item.product.organizationPrice?.customPrice || item.product.basePrice) - item.unitPrice)} due later
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="size-7 p-0"
                  >
                    <MinusIcon className="size-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={item.product.maxQuantityPerOrg || 999}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                    className="w-12 h-7 text-center text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.product.maxQuantityPerOrg && item.quantity >= item.product.maxQuantityPerOrg}
                    className="size-7 p-0"
                  >
                    <PlusIcon className="size-3" />
                  </Button>
                </div>

                {/* Total Price */}
                <div className="text-right">
                  <div className="font-medium text-sm">{formatCurrency(item.totalPrice)}</div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                  className="size-7 p-0 text-destructive hover:text-destructive"
                >
                  <XIcon className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Cart Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Show deposit breakdown if applicable */}
          {totalDeposit > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span>Due Today (Deposits):</span>
                <span className="font-medium text-blue-600">{formatCurrency(totalDeposit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Future Payments:</span>
                <span className="font-medium text-orange-600">{formatCurrency(futurePayments)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Order Total:</span>
                <span className="font-bold">{formatCurrency(cartTotal)}</span>
              </div>
            </>
          )}

          {totalDeposit === 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">{formatCurrency(subtotal)}</span>
            </div>
          )}
        </div>

        {/* Payment Summary Card */}
        {totalDeposit > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Payment Plan</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-700">Pay today:</span>
                <span className="font-medium text-blue-900">{formatCurrency(totalDeposit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Pay later:</span>
                <span className="font-medium text-blue-900">{formatCurrency(futurePayments)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="space-y-2">
        <Button 
          className="w-full" 
          size="lg"
          disabled={items.length === 0}
        >
          <CreditCardIcon className="size-4 mr-2" />
          Proceed to Checkout
          {totalDeposit > 0 && (
            <span className="ml-2">({formatCurrency(totalDeposit > 0 ? totalDeposit : subtotal)})</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}