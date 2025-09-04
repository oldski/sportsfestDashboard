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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
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

export function FloatingShoppingCart() {
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

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const totalDeposit = getTotalDeposit();
  const futurePayments = getFuturePayments();
  const cartTotal = getCartTotal();

  // Don't show floating cart if empty
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button - Only show on mobile/tablet */}
      <div className="fixed top-12 right-6 z-50 xl:hidden">
        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-4 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ShoppingCartIcon className="size-5 mr-2" />
          <span className="font-medium">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
          <Badge variant="secondary" className="ml-2 bg-white/20 text-primary-foreground border-0">
            {formatCurrency(totalDeposit > 0 ? totalDeposit : subtotal)}
          </Badge>
        </Button>
      </div>

      {/* Modal Cart */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCartIcon className="size-5" />
              <span>Shopping Cart</span>
              <Badge variant="secondary">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* Clear Cart Button - Above items */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCart();
                  setIsModalOpen(false); // Close modal after clearing
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="size-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.useDeposit}`}
                  className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg"
                >
                  {/* Remove Button - Left side */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.productId)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                  >
                    <XIcon className="size-3" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight mb-1">{item.product.name}</h4>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {item.product.category.name}
                      </Badge>
                      {item.useDeposit && (
                        <Badge variant="secondary" className="text-xs">
                          Deposit Only
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatCurrency(item.unitPrice)} each
                      {item.useDeposit && item.product.requiresDeposit && (
                        <span className="block mt-1">
                          Balance: {formatCurrency((item.product.organizationPrice?.customPrice || item.product.basePrice) - item.unitPrice)} due later
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-center space-y-3 ml-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <MinusIcon className="size-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.product.availableQuantity !== null
                          ? item.product.availableQuantity + item.quantity // Allow current quantity + available
                          : (item.product.maxQuantityPerOrg || 999)
                        }
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-14 h-8 text-center text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={
                          (item.product.availableQuantity !== null && item.quantity >= (item.product.availableQuantity + item.quantity)) ||
                          (item.product.maxQuantityPerOrg !== undefined && item.quantity >= item.product.maxQuantityPerOrg)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <PlusIcon className="size-3" />
                      </Button>
                    </div>

                    {/* Total Price */}
                    <div className="text-center">
                      <div className="font-medium text-sm">{formatCurrency(item.totalPrice)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Cart Summary */}
            <div className="space-y-3">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-sm text-blue-900 mb-3">Payment Plan</h4>
                <div className="space-y-2 text-sm">
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
          </div>

          {/* Checkout Footer */}
          <div className="border-t px-6 py-4">
            <Button
              className="w-full"
              size="lg"
              disabled={items.length === 0}
              onClick={() => {
                // Close modal and proceed to checkout
                setIsModalOpen(false);
                // TODO: Implement actual checkout logic
                console.log('Proceeding to checkout...');
              }}
            >
              <CreditCardIcon className="size-4 mr-2" />
              Proceed to Checkout
              {totalDeposit > 0 && (
                <span className="ml-2">({formatCurrency(totalDeposit > 0 ? totalDeposit : subtotal)})</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
