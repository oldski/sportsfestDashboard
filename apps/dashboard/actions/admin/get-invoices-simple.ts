'use server';

import { auth } from '@workspace/auth';
import { db, eq, and, desc } from '@workspace/database/client';
import { orderInvoiceTable, orderTable, organizationTable, eventYearTable } from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import type { InvoiceData } from './get-invoices';

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function getAllInvoicesSimple(): Promise<InvoiceData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access invoice data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderInvoiceTable.id,
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        orderId: orderInvoiceTable.orderId,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderNumber: orderTable.orderNumber,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        totalAmount: orderInvoiceTable.totalAmount,
        paidAmount: orderInvoiceTable.paidAmount,
        balanceOwed: orderInvoiceTable.balanceOwed,
        status: orderInvoiceTable.status,
        dueDate: orderInvoiceTable.dueDate,
        paidAt: orderInvoiceTable.paidAt,
        sentAt: orderInvoiceTable.sentAt,
        notes: orderInvoiceTable.notes,
        createdAt: orderInvoiceTable.createdAt,
        updatedAt: orderInvoiceTable.updatedAt,
        isSponsorship: orderTable.isSponsorship,
      })
      .from(orderInvoiceTable)
      .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(eq(orderTable.eventYearId, currentEventYear.id as string))
      .orderBy(desc(orderInvoiceTable.createdAt));

    return result.map(row => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      totalAmount: row.totalAmount,
      paidAmount: row.paidAmount,
      balanceOwed: row.balanceOwed,
      status: row.status as InvoiceData['status'],
      dueDate: row.dueDate ? formatLocalDate(row.dueDate) : undefined,
      paidAt: row.paidAt ? formatLocalDate(row.paidAt) : undefined,
      sentAt: row.sentAt ? formatLocalDate(row.sentAt) : undefined,
      notes: row.notes || undefined,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
      items: [],
      isSponsorship: row.isSponsorship || false,
    }));
  } catch (error) {
    console.error('Error fetching all invoices:', error);
    return [];
  }
}

export async function getInvoicesByStatusSimple(status: InvoiceData['status']): Promise<InvoiceData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access invoice data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderInvoiceTable.id,
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        orderId: orderInvoiceTable.orderId,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        orderNumber: orderTable.orderNumber,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        totalAmount: orderInvoiceTable.totalAmount,
        paidAmount: orderInvoiceTable.paidAmount,
        balanceOwed: orderInvoiceTable.balanceOwed,
        status: orderInvoiceTable.status,
        dueDate: orderInvoiceTable.dueDate,
        paidAt: orderInvoiceTable.paidAt,
        sentAt: orderInvoiceTable.sentAt,
        notes: orderInvoiceTable.notes,
        createdAt: orderInvoiceTable.createdAt,
        updatedAt: orderInvoiceTable.updatedAt,
        isSponsorship: orderTable.isSponsorship,
      })
      .from(orderInvoiceTable)
      .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(orderTable.eventYearId, currentEventYear.id as string),
        eq(orderInvoiceTable.status, status)
      ))
      .orderBy(desc(orderInvoiceTable.createdAt));

    return result.map(row => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      totalAmount: row.totalAmount,
      paidAmount: row.paidAmount,
      balanceOwed: row.balanceOwed,
      status: row.status as InvoiceData['status'],
      dueDate: row.dueDate ? formatLocalDate(row.dueDate) : undefined,
      paidAt: row.paidAt ? formatLocalDate(row.paidAt) : undefined,
      sentAt: row.sentAt ? formatLocalDate(row.sentAt) : undefined,
      notes: row.notes || undefined,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
      items: [],
      isSponsorship: row.isSponsorship || false,
    }));
  } catch (error) {
    console.error(`Error fetching ${status} invoices:`, error);
    return [];
  }
}

export async function getPaidInvoicesSimple(): Promise<InvoiceData[]> {
  return getInvoicesByStatusSimple('paid');
}

export async function getPartialInvoicesSimple(): Promise<InvoiceData[]> {
  return getInvoicesByStatusSimple('partial');
}

export async function getOverdueInvoicesSimple(): Promise<InvoiceData[]> {
  return getInvoicesByStatusSimple('overdue');
}

export async function getSentInvoicesSimple(): Promise<InvoiceData[]> {
  return getInvoicesByStatusSimple('sent');
}

export async function getDraftInvoicesSimple(): Promise<InvoiceData[]> {
  return getInvoicesByStatusSimple('draft');
}

export async function getCancelledInvoicesSimple(): Promise<InvoiceData[]> {
  return getInvoicesByStatusSimple('cancelled');
}