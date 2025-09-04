'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import type { InvoiceData, InvoiceItemData } from './get-invoices';

// Temporary mock data until the invoice tables are properly set up
const mockInvoices: InvoiceData[] = [
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

  // Return all mock invoices sorted by creation date (newest first)
  return mockInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getInvoicesByStatusSimple(status: InvoiceData['status']): Promise<InvoiceData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access invoice data');
  }

  // Return filtered mock invoices
  return mockInvoices
    .filter(invoice => invoice.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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