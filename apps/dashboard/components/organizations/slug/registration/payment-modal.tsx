'use client';

import * as React from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  CreditCardIcon,
  LoaderIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon
} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  clientSecret: string;
  orderId: string;
  orderSummary: {
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    subtotal: number;
    depositAmount?: number;
    totalAmount: number;
    dueToday: number;
    futurePayments: number;
    paymentType: 'full' | 'deposit';
    appliedCoupon?: {
      id: string;
      code: string;
      discountType: 'percentage' | 'fixed_amount';
      discountValue: number;
      calculatedDiscount: number;
    };
    couponDiscount: number;
    discountedSubtotal: number;
    discountedTotal: number;
    // For bank payments where processing fee is waived
    processingFeeWaived?: number;
    isBankPayment?: boolean;
  };
  organizationName: string;
  userEmail: string;
}

type PaymentState = 'idle' | 'processing' | 'succeeded' | 'failed';

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  clientSecret,
  orderId,
  orderSummary,
  organizationName,
  userEmail,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [state, setState] = React.useState<PaymentState>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [isPaymentReady, setIsPaymentReady] = React.useState(false);
  const [isBankPayment, setIsBankPayment] = React.useState(false);

  const isLoading = state === 'processing';
  const isSucceeded = state === 'succeeded';
  const isFailed = state === 'failed';

  // Listen for changes in the PaymentElement to enable/disable the pay button
  React.useEffect(() => {
    if (!elements) return;

    const paymentElement = elements.getElement('payment');
    if (!paymentElement) return;

    const handleChange = (event: any) => {
      // Check if the payment form is complete (email field is now disabled)
      setIsPaymentReady(event.complete);

      if (event.error) {
        setError(event.error.message);
      } else {
        setError(null);
      }
    };

    paymentElement.on('change', handleChange);

    return () => {
      paymentElement.off('change', handleChange);
    };
  }, [elements]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const paymentElement = elements.getElement('payment');

    console.log('🔍 Stripe Elements Debug:', {
      stripe: !!stripe,
      elements: !!elements,
      paymentElement: !!paymentElement
    });

    if (!paymentElement) {
      setError('Payment form is not ready. Please try again.');
      return;
    }

    setState('processing');
    setError(null);

    try {
      // URL encode the organization name for the return URL
      const encodedOrgName = encodeURIComponent(organizationName);
      const returnUrl = `${window.location.origin}/organizations/${encodedOrgName}/registration/orders?success=true&order_id=${orderId}`;

      console.log('💳 Attempting payment confirmation with:', {
        orderId,
        organizationName,
        encodedOrgName,
        return_url: returnUrl
      });

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              email: userEmail,
            },
          },
        },
        redirect: 'if_required',
      });

      console.log('💳 Payment confirmation result:', result);
      console.log('💳 Payment intent status:', result.paymentIntent?.status);
      console.log('💳 Has error:', !!result.error);

      if (result.error) {
        console.log('❌ Payment error:', result.error);
        setState('failed');
        setError(result.error.message || 'An unexpected error occurred.');
      } else if (result.paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded, calling confirm-payment API...');
        // Confirm payment on our backend
        const response = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            orderId,
          }),
        });

        console.log('📡 Confirm payment API response status:', response.status);
        console.log('📡 Confirm payment API response ok:', response.ok);

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Confirm payment API success:', responseData);
          setState('succeeded');
          setTimeout(() => {
            onSuccess(orderId);
            onClose();
          }, 2000);
        } else {
          const errorData = await response.text();
          console.error('❌ Confirm payment API failed:', response.status, errorData);
          setState('failed');
          setError('Payment succeeded but failed to update order. Please contact support.');
        }
      } else if (result.paymentIntent?.status === 'processing') {
        // ACH/Bank payments return 'processing' status - they don't settle instantly
        console.log('🏦 Payment is processing (ACH/Bank transfer)');
        setIsBankPayment(true); // Mark as bank payment for different success messaging

        // Update order status to 'payment_processing' via confirm-payment API
        console.log('🏦 Calling confirm-payment API for ACH processing...');
        const achResponse = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            orderId,
            isAchProcessing: true, // Flag to indicate this is an ACH payment in processing
          }),
        });

        if (achResponse.ok) {
          const achData = await achResponse.json();
          console.log('✅ ACH processing order status updated:', achData);
          setState('succeeded'); // Show success state to user
          setError(null);
          // Show success message and close - the webhook will handle the final confirmation when payment clears
          setTimeout(() => {
            onSuccess(orderId);
            onClose();
          }, 3000); // Give more time to read the bank payment message
        } else {
          const achError = await achResponse.text();
          console.error('❌ Failed to update order for ACH processing:', achError);
          // Still show success since the payment is processing, but log the error
          setState('succeeded');
          setError(null);
          setTimeout(() => {
            onSuccess(orderId);
            onClose();
          }, 3000);
        }
      } else if (result.paymentIntent?.status === 'requires_action') {
        // This happens when additional verification is needed (e.g., microdeposits for manual bank entry)
        console.log('⏳ Payment requires additional action:', result.paymentIntent.next_action);
        setState('failed');
        setError('Your bank account requires additional verification. Please check your email for instructions from Stripe to complete the verification process.');
      } else {
        console.log('⚠️ Payment intent status is not "succeeded":', result.paymentIntent?.status);
        setState('failed');
        setError(`Unexpected payment status: ${result.paymentIntent?.status}. Please contact support.`);
      }
    } catch (err) {
      setState('failed');
      setError('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-none w-screen h-screen max-h-none m-0 rounded-none overflow-y-auto">
        <DialogHeader className="px-2 pt-8">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CreditCardIcon className="h-6 w-6" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription className="text-lg">
            Review your order and complete the secure payment below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-2 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start h-full">
              {/* Order Summary */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
              <CardDescription>
                {organizationName} • Order #{orderId.slice(-8).toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {orderSummary.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        × {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderSummary.subtotal)}</span>
                </div>

                {/* Show coupon discount if applied */}
                {orderSummary.appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({orderSummary.appliedCoupon.code})</span>
                    <span>-{formatCurrency(orderSummary.couponDiscount)}</span>
                  </div>
                )}

                {/* Show processing fee waived for bank payments */}
                {orderSummary.isBankPayment && (
                  <div className="flex justify-between text-green-600">
                    <span>Processing Fee (Bank Transfer)</span>
                    <span>Waived</span>
                  </div>
                )}

                {/* Show breakdown for items with deposits vs full payments */}
                {orderSummary.futurePayments > 0 && (
                  <>
                    <div className="flex justify-between text-primary font-medium">
                      <span>Due Today</span>
                      <span>{formatCurrency(orderSummary.dueToday)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Future Payments</span>
                      <span>{formatCurrency(orderSummary.futurePayments)}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>
                  {orderSummary.futurePayments > 0 ? 'Amount Due Today' : 'Total Amount'}
                </span>
                <span>
                  {formatCurrency(orderSummary.dueToday)}
                </span>
              </div>

              {orderSummary.futurePayments > 0 && (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    This is a deposit payment. The remaining balance will be due later.
                  </AlertDescription>
                </Alert>
              )}

              {orderSummary.isBankPayment && (
                <Alert className="border-green-200 bg-green-50">
                  <InfoIcon className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Bank transfers take 3-5 business days to process. No processing fees apply.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

              {/* Payment Form */}
              <div className="h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Payment Information
                      <Badge variant="secondary">Secure</Badge>
                    </h3>
                  </div>
                  <div>
                    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
                      {/* Stripe Payment Element */}
                      <div className="space-y-4">
                        <PaymentElement
                          options={{
                            fields: {
                              billingDetails: {
                                email: 'never'
                              }
                            }
                          }}
                        />
                      </div>

                      {/* Error Display */}
                      {error && (
                        <Alert variant="destructive">
                          <XCircleIcon className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Success Display */}
                      {isSucceeded && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            {isBankPayment ? (
                              <>
                                <span className="font-medium">Bank transfer initiated!</span>
                                <br />
                                <span className="text-sm">Your payment is processing and typically takes 3-5 business days to complete. You&apos;ll receive a confirmation email once the transfer clears.</span>
                              </>
                            ) : (
                              'Payment successful! Redirecting...'
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Footer with Buttons */}
        <div className="flex flex-col gap-3 p-4 border-t">
          <Button
            type="submit"
            form="payment-form"
            disabled={!stripe || !elements || isLoading || isSucceeded || !isPaymentReady}
            className="w-full"
          >
            {isLoading && (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSucceeded && (
              <CheckCircleIcon className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Processing...' :
             isSucceeded ? (isBankPayment ? 'Transfer Initiated' : 'Payment Complete') :
             `Pay ${formatCurrency(orderSummary.dueToday)}`}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
