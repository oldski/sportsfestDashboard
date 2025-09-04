import * as React from 'react';

import { getRegistrationInvoices } from '~/data/registration/get-invoices';
import { InvoicesDataTable } from '~/components/organizations/slug/registration/invoices-data-table';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

// Test data to showcase the invoice functionality
const mockInvoices: RegistrationInvoiceDto[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2025-001',
    orderId: 'ord-1',
    orderNumber: 'ORD-2025-001',
    totalAmount: 1275.00,
    paidAmount: 425.00,
    balanceOwed: 850.00,
    status: 'sent',
    dueDate: new Date('2025-02-15'),
    sentAt: new Date('2025-01-16'),
    downloadUrl: 'https://example.com/invoice-001.pdf',
    notes: 'Initial registration for SportsFest 2025. Partial payment received.',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-16'),
    order: {
      id: 'ord-1',
      orderNumber: 'ORD-2025-001',
      totalAmount: 1275.00,
      status: 'deposit_paid',
      createdAt: new Date('2025-01-15'),
      items: [
        {
          id: 'item-1',
          productName: 'SportsFest Team Registration',
          quantity: 1,
          unitPrice: 150.00,
          totalPrice: 150.00
        },
        {
          id: 'item-2',
          productName: '10x10 Event Tent',
          quantity: 1,
          unitPrice: 200.00,
          totalPrice: 200.00
        },
        {
          id: 'item-3',
          productName: 'SportsFest T-Shirt',
          quantity: 15,
          unitPrice: 25.00,
          totalPrice: 375.00
        },
        {
          id: 'item-4',
          productName: 'Team Lunch Package',
          quantity: 20,
          unitPrice: 15.00,
          totalPrice: 300.00
        },
        {
          id: 'item-5',
          productName: 'Equipment Setup Fee',
          quantity: 1,
          unitPrice: 250.00,
          totalPrice: 250.00
        }
      ]
    }
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2025-002',
    orderId: 'ord-2',
    orderNumber: 'ORD-2025-002',
    totalAmount: 950.00,
    paidAmount: 950.00,
    balanceOwed: 0.00,
    status: 'paid',
    dueDate: new Date('2025-01-30'),
    sentAt: new Date('2025-01-10'),
    paidAt: new Date('2025-01-12'),
    downloadUrl: 'https://example.com/invoice-002.pdf',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-12'),
    order: {
      id: 'ord-2',
      orderNumber: 'ORD-2025-002',
      totalAmount: 950.00,
      status: 'fully_paid',
      createdAt: new Date('2025-01-10'),
      items: [
        {
          id: 'item-6',
          productName: 'SportsFest Team Registration',
          quantity: 1,
          unitPrice: 150.00,
          totalPrice: 150.00
        },
        {
          id: 'item-7',
          productName: 'SportsFest T-Shirt',
          quantity: 20,
          unitPrice: 25.00,
          totalPrice: 500.00
        },
        {
          id: 'item-8',
          productName: 'Team Lunch Package',
          quantity: 20,
          unitPrice: 15.00,
          totalPrice: 300.00
        }
      ]
    }
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2025-003',
    orderId: 'ord-3',
    orderNumber: 'ORD-2025-003',
    totalAmount: 800.00,
    paidAmount: 0.00,
    balanceOwed: 800.00,
    status: 'overdue',
    dueDate: new Date('2024-12-15'), // Overdue
    sentAt: new Date('2024-12-01'),
    notes: 'Payment overdue. Please contact accounting.',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    order: {
      id: 'ord-3',
      orderNumber: 'ORD-2025-003',
      totalAmount: 800.00,
      status: 'pending',
      createdAt: new Date('2024-12-01'),
      items: [
        {
          id: 'item-9',
          productName: 'SportsFest Team Registration',
          quantity: 1,
          unitPrice: 150.00,
          totalPrice: 150.00
        },
        {
          id: 'item-10',
          productName: '10x10 Event Tent',
          quantity: 2,
          unitPrice: 200.00,
          totalPrice: 400.00
        },
        {
          id: 'item-11',
          productName: 'Equipment Setup Fee',
          quantity: 1,
          unitPrice: 250.00,
          totalPrice: 250.00
        }
      ]
    }
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2025-004',
    orderId: 'ord-4',
    orderNumber: 'ORD-2025-004',
    totalAmount: 2150.00,
    paidAmount: 500.00,
    balanceOwed: 1650.00,
    status: 'sent',
    dueDate: new Date('2025-03-01'),
    sentAt: new Date('2025-01-20'),
    notes: 'Sponsor package with custom pricing. Balance due March 1st.',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-22'),
    order: {
      id: 'ord-4',
      orderNumber: 'ORD-2025-004',
      totalAmount: 2150.00,
      status: 'deposit_paid',
      createdAt: new Date('2025-01-20'),
      items: [
        {
          id: 'item-12',
          productName: 'Premium Team Registration',
          quantity: 2,
          unitPrice: 200.00,
          totalPrice: 400.00
        },
        {
          id: 'item-13',
          productName: '20x20 Premium Event Tent',
          quantity: 1,
          unitPrice: 500.00,
          totalPrice: 500.00
        },
        {
          id: 'item-14',
          productName: 'SportsFest T-Shirt',
          quantity: 50,
          unitPrice: 25.00,
          totalPrice: 1250.00
        }
      ]
    }
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2025-005',
    orderId: 'ord-5',
    orderNumber: 'ORD-2025-005',
    totalAmount: 375.00,
    paidAmount: 0.00,
    balanceOwed: 375.00,
    status: 'draft',
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
    order: {
      id: 'ord-5',
      orderNumber: 'ORD-2025-005',
      totalAmount: 375.00,
      status: 'pending',
      createdAt: new Date('2025-01-25'),
      items: [
        {
          id: 'item-15',
          productName: 'SportsFest T-Shirt',
          quantity: 15,
          unitPrice: 25.00,
          totalPrice: 375.00
        }
      ]
    }
  }
];

export default async function InvoicesPage(): Promise<React.JSX.Element> {
  // For testing purposes, use mock data. In production, uncomment the line below:
  // const invoices = await getRegistrationInvoices();
  const invoices = mockInvoices;

  return (
    <InvoicesDataTable invoices={invoices} />
  );
}
