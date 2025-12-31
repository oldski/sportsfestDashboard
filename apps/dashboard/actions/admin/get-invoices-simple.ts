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

// Temporary mock data - keeping for reference
const mockInvoices_UNUSED: InvoiceData[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-001',
    orderId: 'order-1',
    organizationId: 'org-1',
    organizationName: 'Acme Corporation',
    organizationSlug: 'acme-corp',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 400.00,
    paidAmount: 150.00,
    balanceOwed: 250.00,
    status: 'partial',
    dueDate: '2025-02-15',
    sentAt: '2025-01-15',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-15',
    items: [
      { id: 'item-1', description: '10x10 Event Tent', unitPrice: 200.00, quantity: 2, total: 400.00 }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-002',
    orderId: 'order-2',
    organizationId: 'org-2',
    organizationName: 'TechStart Innovations',
    organizationSlug: 'techstart',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 200.00,
    paidAmount: 75.00,
    balanceOwed: 125.00,
    status: 'partial',
    dueDate: '2025-02-10',
    sentAt: '2025-01-12',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-12',
    items: [
      { id: 'item-2', description: '10x10 Event Tent', unitPrice: 200.00, quantity: 1, total: 200.00 }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-2025-003',
    orderId: 'order-3',
    organizationId: 'org-3',
    organizationName: 'Global Solutions Inc',
    organizationSlug: 'global-solutions',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 450.00,
    paidAmount: 0,
    balanceOwed: 450.00,
    status: 'overdue',
    dueDate: '2025-01-30',
    sentAt: '2025-01-10',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
    items: [
      { id: 'item-3', description: 'SportsFest Team Registration', unitPrice: 150.00, quantity: 1, total: 150.00 },
      { id: 'item-4', description: 'Team Lunch Package', unitPrice: 15.00, quantity: 20, total: 300.00 }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-2025-004',
    orderId: 'order-4',
    organizationId: 'org-4',
    organizationName: 'BlueSky Enterprises',
    organizationSlug: 'bluesky',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 200.00,
    paidAmount: 200.00,
    balanceOwed: 0,
    status: 'paid',
    dueDate: '2025-02-05',
    paidAt: '2025-01-11',
    sentAt: '2025-01-08',
    createdAt: '2025-01-08',
    updatedAt: '2025-01-11',
    items: [
      { id: 'item-5', description: '10x10 Event Tent', unitPrice: 200.00, quantity: 1, total: 200.00 }
    ]
  },
  {
    id: '5',
    invoiceNumber: 'INV-2025-005',
    orderId: 'order-5',
    organizationId: 'org-5',
    organizationName: 'Innovation Labs',
    organizationSlug: 'innovation-labs',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 0.00,
    paidAmount: 0.00,
    balanceOwed: 0.00,
    status: 'paid',
    dueDate: '2025-02-01',
    paidAt: '2025-01-07',
    sentAt: '2025-01-07',
    notes: 'Sponsor courtesy registration - no charge',
    createdAt: '2025-01-07',
    updatedAt: '2025-01-07',
    items: [
      { id: 'item-6', description: 'SportsFest Team Registration (Sponsor)', unitPrice: 0.00, quantity: 1, total: 0.00 },
      { id: 'item-7', description: 'Team Lunch Package (Sponsor)', unitPrice: 0.00, quantity: 15, total: 0.00 }
    ]
  },
  {
    id: '6',
    invoiceNumber: 'INV-2025-006',
    orderId: 'order-6',
    organizationId: 'org-6',
    organizationName: 'Digital Dynamics',
    organizationSlug: 'digital-dynamics',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 350.00,
    paidAmount: 0,
    balanceOwed: 350.00,
    status: 'sent',
    dueDate: '2025-02-20',
    sentAt: '2025-01-20',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-20',
    items: [
      { id: 'item-8', description: 'SportsFest Team Registration', unitPrice: 150.00, quantity: 1, total: 150.00 },
      { id: 'item-9', description: '10x10 Event Tent', unitPrice: 200.00, quantity: 1, total: 200.00 }
    ]
  },
  {
    id: '7',
    invoiceNumber: 'INV-2025-007',
    orderId: 'order-7',
    organizationId: 'org-7',
    organizationName: 'Creative Studios',
    organizationSlug: 'creative-studios',
    eventYearId: 'event-2025',
    eventYear: 2025,
    eventYearName: 'SportsFest 2025',
    totalAmount: 575.00,
    paidAmount: 0,
    balanceOwed: 575.00,
    status: 'draft',
    dueDate: '2025-02-25',
    notes: 'Draft invoice - pending approval',
    createdAt: '2025-01-22',
    updatedAt: '2025-01-22',
    items: [
      { id: 'item-10', description: 'SportsFest Team Registration', unitPrice: 150.00, quantity: 2, total: 300.00 },
      { id: 'item-11', description: 'Team Lunch Package', unitPrice: 15.00, quantity: 10, total: 150.00 },
      { id: 'item-12', description: 'Event T-Shirt Package', unitPrice: 25.00, quantity: 5, total: 125.00 }
    ]
  }
];

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