'use client';

import * as React from 'react';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  XIcon,
  TicketIcon,
  LoaderIcon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger
} from '@workspace/ui/components/drawer';
import { Input } from '@workspace/ui/components/input';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';

import { useShoppingCart } from '~/contexts/shopping-cart-context';
import { usePayment } from '~/hooks/use-payment';
import { PaymentModal } from './payment-modal';
import { StripeElementsProvider } from '~/contexts/stripe-context';
import { useParams } from 'next/navigation';
import { toast } from '@workspace/ui/components/sonner';
import { useSession } from 'next-auth/react';
import { useActiveOrganization } from '~/hooks/use-active-organization';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export function ShoppingCartDrawer() {
  const {
    items,
    appliedCoupon,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotalDeposit,
    getDueToday,
    getFuturePayments,
    getCartTotal,
    getCouponDiscount,
    getDiscountedSubtotal,
    getDiscountedTotal,
    applyCoupon,
    removeCoupon
  } = useShoppingCart();

  const params = useParams();
  const organizationSlug = params.slug as string;
  const organization = useActiveOrganization();

  // Coupon state
  const [couponCode, setCouponCode] = React.useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
  const { data: session } = useSession();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);

  const {
    isLoading: isPaymentLoading,
    clientSecret,
    orderId,
    orderSummary,
    createPaymentIntent,
    resetPayment
  } = usePayment({
    organizationSlug,
    onSuccess: (orderId) => {
      toast.success('Payment completed successfully!');
      clearCart();
      resetPayment();
      setPaymentModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Payment failed: ${error}`);
    }
  });

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const totalDeposit = getTotalDeposit();
  const dueToday = getDueToday();
  const futurePayments = getFuturePayments();
  const cartTotal = getCartTotal();

  // Convert cart items to payment hook format
  const convertCartItemsForPayment = () => {
    return items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      unitPrice: item.unitPrice,
      depositPrice: item.useDeposit ? item.depositPrice : undefined,
      useDeposit: item.useDeposit,
      fullPrice: item.product.organizationPrice?.customPrice || item.product.basePrice,
    }));
  };

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (!organization?.id) {
      toast.error('Organization not found');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await applyCoupon(couponCode.toUpperCase(), organization.id);
      if (result.success) {
        toast.success(`Coupon "${couponCode.toUpperCase()}" applied successfully!`);
        setCouponCode('');
      } else {
        toast.error(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  const handleCheckout = async (paymentType: 'full' | 'deposit') => {
    const paymentItems = convertCartItemsForPayment();
    await createPaymentIntent(paymentItems, paymentType, appliedCoupon || undefined);
    setIsDrawerOpen(false); // Close drawer
    setPaymentModalOpen(true); // Open payment modal
  };

  // Don't show floating cart if empty
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        {/* Floating Cart Button - Show on all screen sizes */}
        <div className="fixed bottom-6 right-6 z-50">
          <DrawerTrigger asChild>
            <Button
              size="lg"
              className="h-14 px-4 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCartIcon className="size-5 mr-2" />
              <span className="font-medium">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
              <Badge variant="secondary" className="ml-2 bg-white/20 text-primary-foreground border-0">
                {formatCurrency(dueToday)}
              </Badge>
            </Button>
          </DrawerTrigger>
        </div>

        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex items-center space-x-2">
              <ShoppingCartIcon className="size-5" />
              <span>Shopping Cart</span>
              <Badge variant="secondary">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Badge>
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Clear Cart Button - Above items */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCart();
                  setIsDrawerOpen(false); // Close drawer after clearing
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
                    onClick={() => removeItem(item.productId, item.useDeposit)}
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
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.useDeposit)}
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
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1, item.useDeposit)}
                        className="w-14 h-8 text-center text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.useDeposit)}
                        disabled={
                          item.product.availableQuantity !== null
                            ? item.quantity >= item.product.availableQuantity
                            : (item.product.maxQuantityPerOrg ? item.quantity >= item.product.maxQuantityPerOrg : false)
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

            {/* Coupon Section */}
            <div className="space-y-3">
              {appliedCoupon ? (
                // Applied coupon display
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TicketIcon className="size-4 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          Coupon Applied: {appliedCoupon.code}
                        </div>
                        <div className="text-xs text-green-600">
                          {appliedCoupon.discountType === 'percentage'
                            ? `${appliedCoupon.discountValue}% off`
                            : `${formatCurrency(appliedCoupon.discountValue)} off`
                          }
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700 p-1"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Coupon input form
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1 text-sm"
                      disabled={isApplyingCoupon}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-3"
                    >
                      {isApplyingCoupon ? (
                        <LoaderIcon className="size-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Cart Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {/* Show coupon discount if applied */}
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Coupon Discount ({appliedCoupon.code}):</span>
                  <span className="font-medium text-green-600">-{formatCurrency(getCouponDiscount())}</span>
                </div>
              )}

              {/* Show deposit breakdown if applicable */}
              {totalDeposit > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Due Today:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(Math.max(0, dueToday - getCouponDiscount()))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Future Payments:</span>
                    <span className="font-medium text-orange-600">{formatCurrency(futurePayments)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Order Total:</span>
                    <span className="font-bold">{formatCurrency(getDiscountedTotal())}</span>
                  </div>
                </>
              )}

              {totalDeposit === 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(getDiscountedSubtotal())}</span>
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
                    <span className="font-medium text-blue-900">{formatCurrency(dueToday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Pay later:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(futurePayments)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer with Buttons */}
          <DrawerFooter className="border-t">
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleCheckout(totalDeposit > 0 ? 'deposit' : 'full')}
              disabled={items.length === 0 || isPaymentLoading}
            >
              <CreditCardIcon className="size-4 mr-2" />
              {isPaymentLoading
                ? 'Processing...'
                : `Complete Purchase - ${formatCurrency(
                    totalDeposit > 0
                      ? Math.max(0, dueToday - getCouponDiscount())
                      : getDiscountedSubtotal()
                  )}`
              }
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Payment Modal */}
      {clientSecret && orderId && orderSummary && (
        <StripeElementsProvider clientSecret={clientSecret}>
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              resetPayment();
            }}
            onSuccess={(completedOrderId) => {
              toast.success('Payment completed successfully!');
              clearCart();
              resetPayment();
              setPaymentModalOpen(false);
            }}
            clientSecret={clientSecret}
            orderId={orderId}
            orderSummary={orderSummary}
            organizationName={organization.name}
            userEmail={session?.user?.email || ''}
          />
        </StripeElementsProvider>
      )}
    </>
  );
}