'use client';

import * as React from 'react';
import type { 
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse 
} from '~/app/api/stripe/create-payment-intent/route';

export interface PaymentHookOptions {
  organizationSlug: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  unitPrice: number;
  depositPrice?: number;
  useDeposit?: boolean;
  fullPrice: number;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  calculatedDiscount: number;
}

export interface OrderSummary {
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isDeposit?: boolean;
    fullPrice?: number;
  }>;
  subtotal: number;
  depositAmount?: number;
  totalAmount: number;
  dueToday: number;
  futurePayments: number;
  paymentType: 'full' | 'deposit';
  appliedCoupon?: AppliedCoupon;
  couponDiscount: number;
  discountedSubtotal: number;
  discountedTotal: number;
}

export function usePayment({ organizationSlug, onSuccess, onError }: PaymentHookOptions) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [orderSummary, setOrderSummary] = React.useState<OrderSummary | null>(null);

  const createPaymentIntent = React.useCallback(async (
    cartItems: CartItem[],
    paymentType: 'full' | 'deposit',
    appliedCoupon?: AppliedCoupon
  ) => {
    setIsLoading(true);
    try {
      // Calculate order summary similar to shopping cart logic
      const items = cartItems.map(item => {
        const isUsingDeposit = item.useDeposit && item.depositPrice !== undefined;

        return {
          name: item.name + (isUsingDeposit ? ' (Deposit)' : ''),
          quantity: item.quantity,
          unitPrice: item.unitPrice, // This is already the effective price from cart
          totalPrice: item.unitPrice * item.quantity,
          isDeposit: isUsingDeposit,
          fullPrice: isUsingDeposit ? item.fullPrice : undefined,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Calculate coupon discount
      const couponDiscount = appliedCoupon?.calculatedDiscount || 0;
      const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

      // Calculate future payments for deposit items
      const futurePayments = items.reduce((sum, item) => {
        if (item.isDeposit && item.fullPrice) {
          return sum + ((item.fullPrice - item.unitPrice) * item.quantity);
        }
        return sum;
      }, 0);

      // Calculate total order value (including future payments)
      const totalOrderValue = items.reduce((sum, item) => {
        if (item.isDeposit && item.fullPrice) {
          return sum + (item.fullPrice * item.quantity);
        }
        return sum + item.totalPrice;
      }, 0);

      const discountedTotal = Math.max(0, totalOrderValue - couponDiscount);
      const discountedDueToday = Math.max(0, subtotal - couponDiscount);

      const summary: OrderSummary = {
        items,
        subtotal,
        depositAmount: paymentType === 'deposit' ? discountedDueToday : undefined,
        totalAmount: totalOrderValue,
        dueToday: discountedDueToday,
        futurePayments,
        paymentType,
        appliedCoupon,
        couponDiscount,
        discountedSubtotal,
        discountedTotal,
      };

      setOrderSummary(summary);

      // For 100% off coupons, skip payment processing entirely
      if (discountedDueToday <= 0) {
        // Create order without payment intent
        const request = {
          organizationSlug,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentType,
          appliedCoupon,
          skipPayment: true, // Flag to indicate no payment needed
        };

        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(responseText || 'Failed to create order');
        }

        const data = await response.json();

        // For free orders, complete them immediately via the confirm-payment endpoint
        try {
          const confirmResponse = await fetch('/api/stripe/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: data.orderId,
              paymentIntentId: 'free_order',
              isFreeOrder: true,
            }),
          });

          if (!confirmResponse.ok) {
            const errorText = await confirmResponse.text();
            console.error('Failed to confirm free order:', errorText);
            throw new Error('Failed to complete free order');
          }

          // Set order ID and call success callback
          setOrderId(data.orderId);

          // Call success callback after a brief delay for UX
          setTimeout(() => {
            onSuccess?.(data.orderId);
          }, 1000);

          return;
        } catch (confirmError) {
          console.error('Error confirming free order:', confirmError);
          throw new Error('Failed to complete free order');
        }
      }

      // Create payment intent for non-free orders
      const request: CreatePaymentIntentRequest = {
        organizationSlug,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentType,
        appliedCoupon,
      };

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Payment intent creation failed:', response.status, responseText);
        
        // Try to parse as JSON, fallback to text error
        let errorMessage = 'Failed to create payment intent';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = responseText.includes('<!DOCTYPE') 
            ? `Server error (${response.status})` 
            : responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data: CreatePaymentIntentResponse;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }
      
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      console.error('Error creating payment intent:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationSlug, onError]);

  const resetPayment = React.useCallback(() => {
    setClientSecret(null);
    setOrderId(null);
    setOrderSummary(null);
  }, []);

  const handlePaymentSuccess = React.useCallback((completedOrderId: string) => {
    onSuccess?.(completedOrderId);
    resetPayment();
  }, [onSuccess, resetPayment]);

  return {
    isLoading,
    clientSecret,
    orderId,
    orderSummary,
    createPaymentIntent,
    resetPayment,
    handlePaymentSuccess,
  };
}