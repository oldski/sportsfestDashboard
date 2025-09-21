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
    paymentType: 'full' | 'deposit';
  };
  organizationName: string;
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
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [state, setState] = React.useState<PaymentState>('idle');
  const [error, setError] = React.useState<string | null>(null);
  
  const isLoading = state === 'processing';
  const isSucceeded = state === 'succeeded';
  const isFailed = state === 'failed';

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
        },
        redirect: 'if_required',
      });

      console.log('💳 Payment confirmation result:', result);

      if (result.error) {
        setState('failed');
        setError(result.error.message || 'An unexpected error occurred.');
      } else if (result.paymentIntent?.status === 'succeeded') {
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

        if (response.ok) {
          setState('succeeded');
          setTimeout(() => {
            onSuccess(orderId);
            onClose();
          }, 2000);
        } else {
          setState('failed');
          setError('Payment succeeded but failed to update order. Please contact support.');
        }
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription>
            Review your order and complete the secure payment below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
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
                
                {orderSummary.paymentType === 'deposit' && orderSummary.depositAmount && (
                  <>
                    <div className="flex justify-between text-primary font-medium">
                      <span>Deposit Payment</span>
                      <span>{formatCurrency(orderSummary.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Remaining Balance</span>
                      <span>{formatCurrency(orderSummary.totalAmount - orderSummary.depositAmount)}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>
                  {orderSummary.paymentType === 'deposit' ? 'Amount Due Today' : 'Total Amount'}
                </span>
                <span>
                  {formatCurrency(
                    orderSummary.paymentType === 'deposit' 
                      ? orderSummary.depositAmount || 0 
                      : orderSummary.totalAmount
                  )}
                </span>
              </div>

              {orderSummary.paymentType === 'deposit' && (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    This is a deposit payment. The remaining balance will be due later.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Payment Information
                <Badge variant="secondary">Secure</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Stripe Payment Element */}
                <div className="space-y-4">
                  <PaymentElement />
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
                      Payment successful! Redirecting...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!stripe || !elements || isLoading || isSucceeded}
                    className="flex-1"
                  >
                    {isLoading && (
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSucceeded && (
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Processing...' : 
                     isSucceeded ? 'Payment Complete' :
                     `Pay ${formatCurrency(
                       orderSummary.paymentType === 'deposit' 
                         ? orderSummary.depositAmount || 0 
                         : orderSummary.totalAmount
                     )}`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}