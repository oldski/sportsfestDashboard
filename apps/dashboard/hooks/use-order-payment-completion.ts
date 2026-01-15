import * as React from 'react';
import type { CompleteOrderPaymentRequest, CompleteOrderPaymentResponse, SponsorshipPaymentMethodType } from '~/app/api/orders/complete-payment/route';
import type { OrderSummary } from '~/types/order';

interface UseOrderPaymentCompletionProps {
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export type { OrderSummary, SponsorshipPaymentMethodType };

interface CreatePaymentIntentOptions {
  orderId: string;
  orderItems: Array<{productName: string, quantity: number, unitPrice: number, totalPrice: number}>;
  originalTotal: number;
  // For sponsorships: the selected payment method type
  paymentMethodType?: SponsorshipPaymentMethodType;
  // For sponsorships: override the display amount (used when payment method affects price)
  overrideAmount?: number;
}

interface UseOrderPaymentCompletionResult {
  isLoading: boolean;
  clientSecret: string | null;
  orderId: string | null;
  orderSummary: OrderSummary | null;
  sponsorshipDetails: CompleteOrderPaymentResponse['sponsorshipDetails'] | null;
  createPaymentIntent: (options: CreatePaymentIntentOptions) => Promise<void>;
  // Legacy signature for backwards compatibility
  createPaymentIntentLegacy: (orderId: string, orderItems: Array<{productName: string, quantity: number, unitPrice: number, totalPrice: number}>, originalTotal: number) => Promise<void>;
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
  const [sponsorshipDetails, setSponsorshipDetails] = React.useState<CompleteOrderPaymentResponse['sponsorshipDetails'] | null>(null);

  const createPaymentIntent = React.useCallback(async (options: CreatePaymentIntentOptions) => {
    const { orderId: orderIdParam, orderItems, originalTotal, paymentMethodType, overrideAmount } = options;

    console.log('🔄 Creating payment intent for order:', orderIdParam, { paymentMethodType });
    setIsLoading(true);

    try {
      const requestBody: CompleteOrderPaymentRequest = {
        orderId: orderIdParam,
        ...(paymentMethodType && { paymentMethodType })
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

      // Use override amount if provided, otherwise use response amount
      const displayAmount = overrideAmount ?? data.remainingAmount;

      // Check if this is a bank payment with fee waived (for sponsorships)
      const isBankPayment = data.sponsorshipDetails?.paymentMethodType === 'us_bank_account';
      const processingFeeWaived = isBankPayment && data.sponsorshipDetails?.processingFee === 0
        ? (originalTotal - displayAmount) // The difference is the waived fee
        : undefined;

      // For bank payments, use the base amount as subtotal (not the amount with fee)
      const displaySubtotal = isBankPayment ? displayAmount : originalTotal;

      // Create order summary for the remaining balance
      const summary: OrderSummary = {
        items: orderItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        subtotal: displaySubtotal,
        totalAmount: displayAmount,
        dueToday: displayAmount,
        futurePayments: 0,
        paymentType: 'full',
        couponDiscount: 0,
        discountedSubtotal: displaySubtotal,
        discountedTotal: displayAmount,
        processingFeeWaived,
        isBankPayment
      };

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setOrderSummary(summary);
      setSponsorshipDetails(data.sponsorshipDetails || null);

      console.log('✅ Order payment completion setup successful:', {
        orderId: data.orderId,
        remainingAmount: data.remainingAmount,
        hasClientSecret: !!data.clientSecret,
        orderSummary: summary,
        sponsorshipDetails: data.sponsorshipDetails
      });

    } catch (error) {
      console.error('❌ Error setting up order payment completion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Legacy function for backwards compatibility
  const createPaymentIntentLegacy = React.useCallback(async (
    orderIdParam: string,
    orderItems: Array<{productName: string, quantity: number, unitPrice: number, totalPrice: number}>,
    originalTotal: number
  ) => {
    return createPaymentIntent({
      orderId: orderIdParam,
      orderItems,
      originalTotal
    });
  }, [createPaymentIntent]);

  const resetPayment = React.useCallback(() => {
    setClientSecret(null);
    setOrderId(null);
    setOrderSummary(null);
    setSponsorshipDetails(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    clientSecret,
    orderId,
    orderSummary,
    sponsorshipDetails,
    createPaymentIntent,
    createPaymentIntentLegacy,
    resetPayment
  };
}