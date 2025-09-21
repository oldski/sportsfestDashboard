'use client';

import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_BILLING_STRIPE_PUBLISHABLE_KEY!);

interface StripeContextType {
  stripe: Stripe | null;
}

const StripeContext = React.createContext<StripeContextType | null>(null);

export function useStripe() {
  const context = React.useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripe, setStripe] = React.useState<Stripe | null>(null);

  React.useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  return (
    <StripeContext.Provider value={{ stripe }}>
      {children}
    </StripeContext.Provider>
  );
}

interface StripeElementsProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export function StripeElementsProvider({ 
  children, 
  clientSecret 
}: StripeElementsProviderProps) {
  const options = React.useMemo(() => {
    if (!clientSecret) return undefined;
    
    console.log('🔧 Stripe Elements Provider - Client Secret:', clientSecret);
    
    return {
      clientSecret,
      // Minimal configuration to test if styling is causing issues
    };
  }, [clientSecret]);

  if (!clientSecret || !options) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}