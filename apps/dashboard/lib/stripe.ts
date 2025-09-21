import { BillingProvider } from '@workspace/billing/provider';

// Use the existing Stripe instance from billing workspace
export const stripe = BillingProvider.getStripe();

// Client-side publishable key - not a server action, just a constant
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_BILLING_STRIPE_PUBLISHABLE_KEY!;

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'],
  captureMethod: 'automatic' as const,
  confirmationMethod: 'automatic' as const,
} as const;