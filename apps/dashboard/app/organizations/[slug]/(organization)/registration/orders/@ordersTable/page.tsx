import * as React from 'react';

import { getRegistrationOrders } from '~/data/registration/get-orders';
import { OrdersDataTable } from '~/components/organizations/slug/registration/orders-data-table';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

// Test data to showcase the order functionality
const mockOrders: RegistrationOrderDto[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2025-001',
    organizationId: 'org-1',
    totalAmount: 1275.00,
    status: 'deposit_paid',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-16'),
    items: [
      {
        id: 'item-1',
        productName: 'SportsFest Team Registration',
        productCategory: 'Registration',
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00
      },
      {
        id: 'item-2',
        productName: '10x10 Event Tent',
        productCategory: 'Equipment',
        quantity: 1,
        unitPrice: 200.00,
        totalPrice: 200.00
      },
      {
        id: 'item-3',
        productName: 'SportsFest T-Shirt',
        productCategory: 'Merchandise',
        quantity: 15,
        unitPrice: 25.00,
        totalPrice: 375.00
      },
      {
        id: 'item-4',
        productName: 'Team Lunch Package',
        productCategory: 'Catering',
        quantity: 20,
        unitPrice: 15.00,
        totalPrice: 300.00
      },
      {
        id: 'item-5',
        productName: 'Equipment Setup Fee',
        productCategory: 'Services',
        quantity: 1,
        unitPrice: 250.00,
        totalPrice: 250.00
      }
    ],
    payments: [
      {
        id: 'pay-1',
        amount: 425.00,
        paymentDate: new Date('2025-01-16'),
        method: 'Credit Card',
        status: 'completed'
      }
    ],
    invoices: [
      {
        id: 'inv-1',
        invoiceNumber: 'INV-2025-001',
        status: 'sent',
        totalAmount: 1275.00,
        paidAmount: 425.00,
        balanceOwed: 850.00
      }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2025-002',
    organizationId: 'org-1',
    totalAmount: 950.00,
    status: 'fully_paid',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-12'),
    items: [
      {
        id: 'item-6',
        productName: 'SportsFest Team Registration',
        productCategory: 'Registration',
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00
      },
      {
        id: 'item-7',
        productName: 'SportsFest T-Shirt',
        productCategory: 'Merchandise',
        quantity: 20,
        unitPrice: 25.00,
        totalPrice: 500.00
      },
      {
        id: 'item-8',
        productName: 'Team Lunch Package',
        productCategory: 'Catering',
        quantity: 20,
        unitPrice: 15.00,
        totalPrice: 300.00
      }
    ],
    payments: [
      {
        id: 'pay-2',
        amount: 950.00,
        paymentDate: new Date('2025-01-12'),
        method: 'Bank Transfer',
        status: 'completed'
      }
    ],
    invoices: [
      {
        id: 'inv-2',
        invoiceNumber: 'INV-2025-002',
        status: 'paid',
        totalAmount: 950.00,
        paidAmount: 950.00,
        balanceOwed: 0.00
      }
    ]
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2025-003',
    organizationId: 'org-1',
    totalAmount: 800.00,
    status: 'pending',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
    items: [
      {
        id: 'item-9',
        productName: 'SportsFest Team Registration',
        productCategory: 'Registration',
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00
      },
      {
        id: 'item-10',
        productName: '10x10 Event Tent',
        productCategory: 'Equipment',
        quantity: 2,
        unitPrice: 200.00,
        totalPrice: 400.00
      },
      {
        id: 'item-11',
        productName: 'Equipment Setup Fee',
        productCategory: 'Services',
        quantity: 1,
        unitPrice: 250.00,
        totalPrice: 250.00
      }
    ],
    payments: [],
    invoices: [
      {
        id: 'inv-3',
        invoiceNumber: 'INV-2025-003',
        status: 'overdue',
        totalAmount: 800.00,
        paidAmount: 0.00,
        balanceOwed: 800.00
      }
    ]
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2025-004',
    organizationId: 'org-1',
    totalAmount: 2150.00,
    status: 'deposit_paid',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-22'),
    items: [
      {
        id: 'item-12',
        productName: 'Premium Team Registration',
        productCategory: 'Registration',
        quantity: 2,
        unitPrice: 200.00,
        totalPrice: 400.00
      },
      {
        id: 'item-13',
        productName: '20x20 Premium Event Tent',
        productCategory: 'Equipment',
        quantity: 1,
        unitPrice: 500.00,
        totalPrice: 500.00
      },
      {
        id: 'item-14',
        productName: 'SportsFest T-Shirt',
        productCategory: 'Merchandise',
        quantity: 50,
        unitPrice: 25.00,
        totalPrice: 1250.00
      }
    ],
    payments: [
      {
        id: 'pay-3',
        amount: 500.00,
        paymentDate: new Date('2025-01-22'),
        method: 'Credit Card',
        status: 'completed'
      }
    ],
    invoices: [
      {
        id: 'inv-4',
        invoiceNumber: 'INV-2025-004',
        status: 'sent',
        totalAmount: 2150.00,
        paidAmount: 500.00,
        balanceOwed: 1650.00
      }
    ]
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2025-005',
    organizationId: 'org-1',
    totalAmount: 375.00,
    status: 'pending',
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
    items: [
      {
        id: 'item-15',
        productName: 'SportsFest T-Shirt',
        productCategory: 'Merchandise',
        quantity: 15,
        unitPrice: 25.00,
        totalPrice: 375.00
      }
    ],
    payments: [],
    invoices: []
  }
];

export default async function OrdersTablePage(): Promise<React.JSX.Element> {
  // For testing purposes, use mock data. In production, uncomment the line below:
  // const orders = await getRegistrationOrders();
  const orders = mockOrders;

  return (
    <OrdersDataTable orders={orders} />
  );
}
