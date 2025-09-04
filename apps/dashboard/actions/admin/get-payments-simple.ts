'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-tent-tracking';
import type { PaymentData } from './get-payments';

// Temporary mock data until the payment tables are properly set up
const mockPayments: PaymentData[] = [
  {
    id: '1',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    organizationSlug: 'acme-corp',
    orderId: 'order-1',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'deposit_payment',
    amount: 150.00,
    status: 'completed',
    stripePaymentIntentId: 'pi_1234567890',
    processedAt: '2025-01-15',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
    source: 'order_payment',
  },
  {
    id: '2',
    organizationId: 'org-2',
    organizationName: 'TechStart Innovations',
    organizationSlug: 'techstart',
    orderId: 'order-2',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'deposit_payment',
    amount: 75.00,
    status: 'pending',
    createdAt: '2025-01-14',
    updatedAt: '2025-01-14',
    source: 'order_payment',
  },
  {
    id: '3',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    organizationSlug: 'acme-corp',
    orderId: 'order-1',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'balance_payment',
    amount: 250.00,
    status: 'pending',
    createdAt: '2025-01-13',
    updatedAt: '2025-01-13',
    source: 'order_payment',
  },
  {
    id: '4',
    organizationId: 'org-3',
    organizationName: 'Global Solutions Inc',
    organizationSlug: 'global-solutions',
    orderId: 'order-3',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'team_registration',
    amount: 300.00,
    status: 'failed',
    stripePaymentIntentId: 'pi_failed_1234',
    failureReason: 'insufficient_funds',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
    source: 'payment',
  },
  {
    id: '5',
    organizationId: 'org-4',
    organizationName: 'BlueSky Enterprises',
    organizationSlug: 'bluesky',
    orderId: 'order-4',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'balance_payment',
    amount: 200.00,
    status: 'completed',
    stripePaymentIntentId: 'pi_completed_5678',
    processedAt: '2025-01-11',
    createdAt: '2025-01-11',
    updatedAt: '2025-01-11',
    source: 'order_payment',
  },
  {
    id: '6',
    organizationId: 'org-5',
    organizationName: 'Innovation Labs',
    organizationSlug: 'innovation-labs',
    orderId: 'order-5',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'tent_rental',
    amount: 400.00,
    status: 'completed',
    stripePaymentIntentId: 'pi_tent_rental_789',
    processedAt: '2025-01-10',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
    source: 'order_payment',
  },
  {
    id: '7',
    organizationId: 'org-6',
    organizationName: 'Digital Dynamics',
    organizationSlug: 'digital-dynamics',
    orderId: 'order-6',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    paymentType: 'product_purchase',
    amount: 125.00,
    status: 'failed',
    stripePaymentIntentId: 'pi_failed_product_456',
    failureReason: 'card_declined',
    createdAt: '2025-01-09',
    updatedAt: '2025-01-09',
    source: 'order_payment',
  }
];

export async function getPendingPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  // Return mock pending payments
  return mockPayments.filter(payment => payment.status === 'pending');
}

export async function getCompletedPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  // Return mock completed payments (sorted by completion date, newest first)
  return mockPayments
    .filter(payment => payment.status === 'completed')
    .sort((a, b) => new Date(b.processedAt || b.createdAt).getTime() - new Date(a.processedAt || a.createdAt).getTime());
}

export async function getFailedPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  // Return mock failed payments
  return mockPayments.filter(payment => payment.status === 'failed');
}

export async function getAllPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  // Return all mock payments sorted by creation date
  return mockPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}