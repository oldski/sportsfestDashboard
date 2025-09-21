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
}

export interface OrderSummary {
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  depositAmount?: number;
  totalAmount: number;
  paymentType: 'full' | 'deposit';
}

export function usePayment({ organizationSlug, onSuccess, onError }: PaymentHookOptions) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [orderSummary, setOrderSummary] = React.useState<OrderSummary | null>(null);

  const createPaymentIntent = React.useCallback(async (
    cartItems: CartItem[],
    paymentType: 'full' | 'deposit'
  ) => {
    setIsLoading(true);
    try {
      // Calculate order summary
      const items = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const depositAmount = cartItems.reduce((sum, item) => 
        sum + (item.depositPrice || 0) * item.quantity, 0
      );

      const summary: OrderSummary = {
        items,
        subtotal,
        depositAmount: paymentType === 'deposit' ? depositAmount : undefined,
        totalAmount: subtotal,
        paymentType,
      };

      setOrderSummary(summary);

      // Create payment intent
      const request: CreatePaymentIntentRequest = {
        organizationSlug,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentType,
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