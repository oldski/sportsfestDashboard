'use server';

import { db, eq, desc, and, or } from '@workspace/database/client';
import { 
  orderInvoiceTable,
  orderTable,
  organizationTable, 
  eventYearTable,
  orderItemTable,
  productTable
} from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-tent-tracking';

export type InvoiceData = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  organizationId: string | null;
  organizationName: string;
  organizationSlug: string;
  eventYearId: string | null;
  eventYear: number;
  eventYearName: string;
  totalAmount: number;
  paidAmount: number;
  balanceOwed: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  dueDate?: string;
  paidAt?: string;
  sentAt?: string;
  downloadUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItemData[];
};

export type InvoiceItemData = {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

export async function getInvoicesByStatus(status?: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled', eventYearId?: string): Promise<InvoiceData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access invoice data');
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

    // Build the where clause
    const whereConditions = [
      eq(orderTable.eventYearId, targetEventYearId),
      eq(eventYearTable.isDeleted, false)
    ];

    if (status) {
      whereConditions.push(eq(orderInvoiceTable.status, status));
    }

    // Get invoices with related data
    const invoicesData = await db
      .select({
        id: orderInvoiceTable.id,
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        orderId: orderInvoiceTable.orderId,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
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
        downloadUrl: orderInvoiceTable.downloadUrl,
        notes: orderInvoiceTable.notes,
        createdAt: orderInvoiceTable.createdAt,
        updatedAt: orderInvoiceTable.updatedAt,
      })
      .from(orderInvoiceTable)
      .leftJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
      .leftJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .leftJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(...whereConditions))
      .orderBy(desc(orderInvoiceTable.createdAt));

    // Get invoice items for each invoice
    const invoicesWithItems = await Promise.all(
      invoicesData.map(async (invoice) => {
        const items = await db
          .select({
            id: orderItemTable.id,
            description: productTable.name,
            unitPrice: orderItemTable.unitPrice,
            quantity: orderItemTable.quantity,
            total: orderItemTable.totalPrice,
          })
          .from(orderItemTable)
          .leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
          .where(eq(orderItemTable.orderId, invoice.orderId));

        // Calculate status based on payments
        let calculatedStatus = invoice.status as InvoiceData['status'];
        if (invoice.status !== 'cancelled' && invoice.status !== 'draft') {
          if (invoice.balanceOwed === 0) {
            calculatedStatus = 'paid';
          } else if (invoice.paidAmount > 0) {
            calculatedStatus = 'partial';
          } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
            calculatedStatus = 'overdue';
          }
        }

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          orderId: invoice.orderId,
          organizationId: invoice.organizationId,
          organizationName: invoice.organizationName || 'Unknown Organization',
          organizationSlug: invoice.organizationSlug || '',
          eventYearId: invoice.eventYearId,
          eventYear: invoice.eventYear || 0,
          eventYearName: invoice.eventYearName || 'Unknown Event',
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          balanceOwed: invoice.balanceOwed,
          status: calculatedStatus,
          dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : undefined,
          paidAt: invoice.paidAt ? invoice.paidAt.toISOString().split('T')[0] : undefined,
          sentAt: invoice.sentAt ? invoice.sentAt.toISOString().split('T')[0] : undefined,
          downloadUrl: invoice.downloadUrl || undefined,
          notes: invoice.notes || undefined,
          createdAt: invoice.createdAt.toISOString().split('T')[0],
          updatedAt: invoice.updatedAt.toISOString().split('T')[0],
          items: items.map(item => ({
            id: item.id,
            description: item.description || 'Unknown Product',
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total: item.total,
          })),
        };
      })
    );

    return invoicesWithItems;

  } catch (error) {
    console.error('Error fetching invoices:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function getAllInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus(undefined, eventYearId);
}

export async function getDraftInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus('draft', eventYearId);
}

export async function getSentInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus('sent', eventYearId);
}

export async function getPaidInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus('paid', eventYearId);
}

export async function getPartialInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus('partial', eventYearId);
}

export async function getOverdueInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus('overdue', eventYearId);
}

export async function getCancelledInvoices(eventYearId?: string): Promise<InvoiceData[]> {
  return getInvoicesByStatus('cancelled', eventYearId);
}