'use server';

import { auth } from '@workspace/auth';
import { db, eq, and, sql, desc } from '@workspace/database/client';
import { orderPaymentTable, orderTable, organizationTable, eventYearTable, PaymentStatus } from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import type { PaymentData } from './get-payments';

// Helper function to format date in local timezone
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function getPendingPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderPaymentTable.id,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderId: orderPaymentTable.orderId,
        orderNumber: orderTable.orderNumber,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        paymentType: orderPaymentTable.type,
        amount: orderPaymentTable.amount,
        status: orderPaymentTable.status,
        stripePaymentIntentId: orderPaymentTable.stripePaymentIntentId,
        processedAt: orderPaymentTable.processedAt,
        createdAt: orderPaymentTable.createdAt,
        updatedAt: orderPaymentTable.updatedAt,
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(orderPaymentTable.status, PaymentStatus.PENDING),
        eq(orderTable.eventYearId, currentEventYear.id as string)
      ));

    return result.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      paymentType: row.paymentType,
      amount: row.amount,
      status: row.status as 'pending' | 'completed' | 'failed' | 'refunded',
      stripePaymentIntentId: row.stripePaymentIntentId || undefined,
      processedAt: row.processedAt ? formatLocalDate(row.processedAt) : undefined,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return [];
  }
}

export async function getCompletedPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderPaymentTable.id,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderId: orderPaymentTable.orderId,
        orderNumber: orderTable.orderNumber,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        paymentType: orderPaymentTable.type,
        amount: orderPaymentTable.amount,
        status: orderPaymentTable.status,
        stripePaymentIntentId: orderPaymentTable.stripePaymentIntentId,
        processedAt: orderPaymentTable.processedAt,
        createdAt: orderPaymentTable.createdAt,
        updatedAt: orderPaymentTable.updatedAt,
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(orderPaymentTable.status, PaymentStatus.COMPLETED),
        eq(orderTable.eventYearId, currentEventYear.id as string)
      ));

    return result.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      paymentType: row.paymentType,
      amount: row.amount,
      status: row.status as 'pending' | 'completed' | 'failed' | 'refunded',
      stripePaymentIntentId: row.stripePaymentIntentId || undefined,
      processedAt: row.processedAt ? formatLocalDate(row.processedAt) : undefined,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching completed payments:', error);
    return [];
  }
}

export async function getFailedPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderPaymentTable.id,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderId: orderPaymentTable.orderId,
        orderNumber: orderTable.orderNumber,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        paymentType: orderPaymentTable.type,
        amount: orderPaymentTable.amount,
        status: orderPaymentTable.status,
        stripePaymentIntentId: orderPaymentTable.stripePaymentIntentId,
        failureReason: orderPaymentTable.failureReason,
        processedAt: orderPaymentTable.processedAt,
        createdAt: orderPaymentTable.createdAt,
        updatedAt: orderPaymentTable.updatedAt,
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(orderPaymentTable.status, PaymentStatus.FAILED),
        eq(orderTable.eventYearId, currentEventYear.id as string)
      ));

    return result.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      paymentType: row.paymentType,
      amount: row.amount,
      status: row.status as 'pending' | 'completed' | 'failed' | 'refunded',
      stripePaymentIntentId: row.stripePaymentIntentId || undefined,
      failureReason: row.failureReason || undefined,
      processedAt: row.processedAt ? formatLocalDate(row.processedAt) : undefined,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching failed payments:', error);
    return [];
  }
}

export async function getAllPaymentsSimple(): Promise<PaymentData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderPaymentTable.id,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderId: orderPaymentTable.orderId,
        orderNumber: orderTable.orderNumber,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        paymentType: orderPaymentTable.type,
        amount: orderPaymentTable.amount,
        status: orderPaymentTable.status,
        stripePaymentIntentId: orderPaymentTable.stripePaymentIntentId,
        failureReason: orderPaymentTable.failureReason,
        processedAt: orderPaymentTable.processedAt,
        createdAt: orderPaymentTable.createdAt,
        updatedAt: orderPaymentTable.updatedAt,
      })
      .from(orderPaymentTable)
      .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(eq(orderTable.eventYearId, currentEventYear.id as string))
      .limit(50);

    return result.map(row => ({
      id: row.id,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      paymentType: row.paymentType,
      amount: row.amount,
      status: row.status as 'pending' | 'completed' | 'failed' | 'refunded',
      stripePaymentIntentId: row.stripePaymentIntentId || undefined,
      failureReason: row.failureReason || undefined,
      processedAt: row.processedAt ? formatLocalDate(row.processedAt) : undefined,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching all payments:', error);
    return [];
  }
}
