'use server';

import { db, eq, desc, and, or } from '@workspace/database/client';
import { 
  paymentTable, 
  orderPaymentTable,
  organizationTable, 
  eventYearTable,
  orderTable,
  PaymentStatus
} from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-tent-tracking';

export type PaymentData = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  orderId?: string;
  eventYearId: string;
  eventYear: number;
  eventYearName: string;
  paymentType: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  paymentMethodType?: string;
  last4?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  source: 'payment' | 'order_payment'; // To distinguish between the two tables
};

export async function getPaymentsByStatus(status: PaymentStatus, eventYearId?: string): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    // If no specific event year is provided, get the active one
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const activeEventYear = await getActiveEventYear();
      if (!activeEventYear) {
        return [];
      }
      targetEventYearId = activeEventYear.id;
    }

    // Get payments from the main payment table
    const paymentsFromPaymentTable = await db
      .select({
        id: paymentTable.id,
        organizationId: paymentTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderId: paymentTable.id, // Use payment ID as order ID fallback
        eventYearId: paymentTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        paymentType: paymentTable.paymentType,
        amount: paymentTable.amount,
        status: paymentTable.status,
        stripePaymentIntentId: paymentTable.stripePaymentIntentId,
        stripeChargeId: paymentTable.stripePaymentIntentId, // Use same for both
        paymentMethodType: paymentTable.stripePaymentIntentId, // Placeholder
        last4: paymentTable.stripePaymentIntentId, // Placeholder
        failureReason: paymentTable.stripePaymentIntentId, // Placeholder
        processedAt: paymentTable.paidAt,
        createdAt: paymentTable.createdAt,
        updatedAt: paymentTable.updatedAt,
      })
      .from(paymentTable)
      .leftJoin(organizationTable, eq(paymentTable.organizationId, organizationTable.id))
      .leftJoin(eventYearTable, eq(paymentTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(paymentTable.eventYearId, targetEventYearId),
        eq(paymentTable.status, status),
        eq(eventYearTable.isDeleted, false)
      ))
      .orderBy(desc(paymentTable.createdAt));

    // Get payments from the order payment table
    const paymentsFromOrderPaymentTable = await db
      .select({
        id: orderPaymentTable.id,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderId: orderPaymentTable.orderId,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        paymentType: orderPaymentTable.type,
        amount: orderPaymentTable.amount,
        status: orderPaymentTable.status,
        stripePaymentIntentId: orderPaymentTable.stripePaymentIntentId,
        stripeChargeId: orderPaymentTable.stripeChargeId,
        paymentMethodType: orderPaymentTable.paymentMethodType,
        last4: orderPaymentTable.last4,
        failureReason: orderPaymentTable.failureReason,
        processedAt: orderPaymentTable.processedAt,
        createdAt: orderPaymentTable.createdAt,
        updatedAt: orderPaymentTable.updatedAt,
      })
      .from(orderPaymentTable)
      .leftJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .leftJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .leftJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(orderTable.eventYearId, targetEventYearId),
        eq(orderPaymentTable.status, status),
        eq(eventYearTable.isDeleted, false)
      ))
      .orderBy(desc(orderPaymentTable.createdAt));

    // Combine and format the data
    const combinedPayments: PaymentData[] = [
      ...paymentsFromPaymentTable.map((item) => ({
        id: item.id,
        organizationId: item.organizationId,
        organizationName: item.organizationName || 'Unknown Organization',
        organizationSlug: item.organizationSlug || '',
        orderId: item.orderId,
        eventYearId: item.eventYearId,
        eventYear: item.eventYear || 0,
        eventYearName: item.eventYearName || 'Unknown Event',
        paymentType: item.paymentType as string,
        amount: item.amount,
        status: item.status as 'pending' | 'completed' | 'failed',
        stripePaymentIntentId: item.stripePaymentIntentId || undefined,
        stripeChargeId: item.stripeChargeId || undefined,
        paymentMethodType: item.paymentMethodType || undefined,
        last4: item.last4 || undefined,
        failureReason: item.failureReason || undefined,
        processedAt: item.processedAt ? item.processedAt.toISOString().split('T')[0] : undefined,
        createdAt: item.createdAt.toISOString().split('T')[0],
        updatedAt: item.updatedAt.toISOString().split('T')[0],
        source: 'payment' as const,
      })),
      ...paymentsFromOrderPaymentTable.map((item) => ({
        id: item.id,
        organizationId: item.organizationId || '',
        organizationName: item.organizationName || 'Unknown Organization',
        organizationSlug: item.organizationSlug || '',
        orderId: item.orderId,
        eventYearId: item.eventYearId || '',
        eventYear: item.eventYear || 0,
        eventYearName: item.eventYearName || 'Unknown Event',
        paymentType: item.paymentType as string,
        amount: item.amount,
        status: item.status as 'pending' | 'completed' | 'failed',
        stripePaymentIntentId: item.stripePaymentIntentId || undefined,
        stripeChargeId: item.stripeChargeId || undefined,
        paymentMethodType: item.paymentMethodType || undefined,
        last4: item.last4 || undefined,
        failureReason: item.failureReason || undefined,
        processedAt: item.processedAt ? item.processedAt.toISOString().split('T')[0] : undefined,
        createdAt: item.createdAt.toISOString().split('T')[0],
        updatedAt: item.updatedAt.toISOString().split('T')[0],
        source: 'order_payment' as const,
      }))
    ];

    // Sort by creation date (newest first)
    return combinedPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  } catch (error) {
    console.error('Error fetching payments:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function getPendingPayments(eventYearId?: string): Promise<PaymentData[]> {
  return getPaymentsByStatus(PaymentStatus.PENDING, eventYearId);
}

export async function getCompletedPayments(eventYearId?: string): Promise<PaymentData[]> {
  return getPaymentsByStatus(PaymentStatus.COMPLETED, eventYearId);
}

export async function getFailedPayments(eventYearId?: string): Promise<PaymentData[]> {
  return getPaymentsByStatus(PaymentStatus.FAILED, eventYearId);
}

export async function getAllPayments(eventYearId?: string): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    const [pending, completed, failed] = await Promise.all([
      getPendingPayments(eventYearId),
      getCompletedPayments(eventYearId),
      getFailedPayments(eventYearId)
    ]);

    return [...pending, ...completed, ...failed]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching all payments:', error);
    return [];
  }
}