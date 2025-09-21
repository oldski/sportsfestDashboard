import * as React from 'react';
import type { CompleteOrderPaymentRequest, CompleteOrderPaymentResponse } from '~/app/api/orders/complete-payment/route';

interface UseOrderPaymentCompletionProps {
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
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

interface UseOrderPaymentCompletionResult {
  isLoading: boolean;
  clientSecret: string | null;
  orderId: string | null;
  orderSummary: OrderSummary | null;
  createPaymentIntent: (orderId: string, orderItems: Array<{productName: string, quantity: number, unitPrice: number, totalPrice: number}>, originalTotal: number) => Promise<void>;
  resetPayment: () => void;
}

export function useOrderPaymentCompletion({
  onSuccess,
  onError
}: UseOrderPaymentCompletionProps = {}): UseOrderPaymentCompletionResult {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [orderSummary, setOrderSummary] = React.useState<OrderSummary | null>(null);

  const createPaymentIntent = React.useCallback(async (
    orderIdParam: string, 
    orderItems: Array<{productName: string, quantity: number, unitPrice: number, totalPrice: number}>,
    originalTotal: number
  ) => {
    console.log('🔄 Creating payment intent for order:', orderIdParam);
    setIsLoading(true);
    
    try {
      const requestBody: CompleteOrderPaymentRequest = {
        orderId: orderIdParam
      };

      console.log('📤 Sending request to /api/orders/complete-payment:', requestBody);

      const response = await fetch('/api/orders/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data: CompleteOrderPaymentResponse = await response.json();
      
      console.log('✅ Payment intent response:', data);
      
      if (!data.clientSecret) {
        throw new Error('No client secret received from payment intent');
      }
      
      // Create order summary for the remaining balance
      const summary: OrderSummary = {
        items: orderItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        subtotal: originalTotal,
        totalAmount: data.remainingAmount, // Only paying the remaining amount
        paymentType: 'full' // This is the completion of the order balance
      };
      
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setOrderSummary(summary);

      console.log('✅ Order payment completion setup successful:', {
        orderId: data.orderId,
        remainingAmount: data.remainingAmount,
        hasClientSecret: !!data.clientSecret,
        orderSummary: summary
      });

    } catch (error) {
      console.error('❌ Error setting up order payment completion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      throw error; // Re-throw so the caller can handle it
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const resetPayment = React.useCallback(() => {
    setClientSecret(null);
    setOrderId(null);
    setOrderSummary(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    clientSecret,
    orderId,
    orderSummary,
    createPaymentIntent,
    resetPayment
  };
}