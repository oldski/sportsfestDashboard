'use server';

import { auth } from '@workspace/auth';
import { db, eq, and, sql, desc } from '@workspace/database/client';
import { orderPaymentTable, orderTable, organizationTable, eventYearTable, PaymentStatus } from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import type { PaymentData } from './get-payments';


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
      console.log('No active event year found, returning empty array');
      return [];
    }

    // Simplified query for debugging
    console.log('Attempting to query pending payments for event year:', currentEventYear.id);

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
      ))
      .limit(10);

    console.log('Query executed successfully, found', result.length, 'records');

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
      processedAt: row.processedAt ? row.processedAt.toISOString().split('T')[0] : undefined,
      createdAt: row.createdAt.toISOString().split('T')[0],
      updatedAt: row.updatedAt.toISOString().split('T')[0],
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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
      console.log('No active event year found, returning empty array');
      return [];
    }

    // Simplified query for debugging
    console.log('Attempting to query completed payments for event year:', currentEventYear.id);

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
      ))
      .limit(10);

    console.log('Query executed successfully, found', result.length, 'records');

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
      processedAt: row.processedAt ? row.processedAt.toISOString().split('T')[0] : undefined,
      createdAt: row.createdAt.toISOString().split('T')[0],
      updatedAt: row.updatedAt.toISOString().split('T')[0],
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching completed payments:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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
      console.log('No active event year found, returning empty array');
      return [];
    }

    // Simplified query for debugging
    console.log('Attempting to query failed payments for event year:', currentEventYear.id);

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
      ))
      .limit(10);

    console.log('Query executed successfully, found', result.length, 'records');

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
      processedAt: row.processedAt ? row.processedAt.toISOString().split('T')[0] : undefined,
      createdAt: row.createdAt.toISOString().split('T')[0],
      updatedAt: row.updatedAt.toISOString().split('T')[0],
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching failed payments:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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
      console.log('No active event year found, returning empty array');
      return [];
    }

    // Simplified query for debugging
    console.log('Attempting to query all payments for event year:', currentEventYear.id);

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

    console.log('Query executed successfully, found', result.length, 'records');

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
      processedAt: row.processedAt ? row.processedAt.toISOString().split('T')[0] : undefined,
      createdAt: row.createdAt.toISOString().split('T')[0],
      updatedAt: row.updatedAt.toISOString().split('T')[0],
      source: 'order_payment',
    }));
  } catch (error) {
    console.error('Error fetching all payments:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return [];
  }
}