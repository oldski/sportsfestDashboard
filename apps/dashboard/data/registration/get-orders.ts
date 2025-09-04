import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';

import { db, desc, eq, and } from '@workspace/database/client';
import { 
  order, 
  orderItem, 
  product, 
  productCategory,
  orderPayment,
  orderInvoice
} from '@workspace/database/schema';

import { getOrganizationBySlug } from '~/data/organizations/get-organization-by-slug';
import type { RegistrationOrderDto } from '~/types/dtos/registration-order-dto';

export const getRegistrationOrders = cache(async (organizationSlug: string): Promise<RegistrationOrderDto[]> => {
  const organization = await getOrganizationBySlug(organizationSlug);
  
  if (!organization) {
    notFound();
  }

  try {
    // Get orders with all related data
    const ordersWithItems = await db
      .select({
        // Order fields
        orderId: order.id,
        orderNumber: order.orderNumber,
        organizationId: order.organizationId,
        orderTotalAmount: order.totalAmount,
        orderStatus: order.status,
        orderCreatedAt: order.createdAt,
        orderUpdatedAt: order.updatedAt,
        // Order item fields
        itemId: orderItem.id,
        itemQuantity: orderItem.quantity,
        itemUnitPrice: orderItem.unitPrice,
        itemTotalPrice: orderItem.totalPrice,
        // Product fields
        productName: product.name,
        productCategoryName: productCategory.name,
      })
      .from(order)
      .leftJoin(orderItem, eq(order.id, orderItem.orderId))
      .leftJoin(product, eq(orderItem.productId, product.id))
      .leftJoin(productCategory, eq(product.categoryId, productCategory.id))
      .where(eq(order.organizationId, organization.id as string))
      .orderBy(desc(order.createdAt));

    // Get payments for all orders
    const orderIds = [...new Set(ordersWithItems.map(row => row.orderId))];
    const payments = orderIds.length > 0 ? await db
      .select({
        orderId: orderPayment.orderId,
        paymentId: orderPayment.id,
        amount: orderPayment.amount,
        paymentDate: orderPayment.processedAt,
        method: orderPayment.paymentMethodType,
        status: orderPayment.status,
      })
      .from(orderPayment)
      .where(eq(orderPayment.orderId, orderIds[0])) // This will need to be updated for multiple orders
      : [];

    // Get invoices for all orders
    const invoices = orderIds.length > 0 ? await db
      .select({
        orderId: orderInvoice.orderId,
        invoiceId: orderInvoice.id,
        invoiceNumber: orderInvoice.invoiceNumber,
        invoiceStatus: orderInvoice.status,
        invoiceTotalAmount: orderInvoice.totalAmount,
        invoicePaidAmount: orderInvoice.paidAmount,
        invoiceBalanceOwed: orderInvoice.balanceOwed,
      })
      .from(orderInvoice)
      .where(eq(orderInvoice.orderId, orderIds[0])) // This will need to be updated for multiple orders
      : [];

    // Group the data by order
    const orderMap = new Map<string, RegistrationOrderDto>();

    ordersWithItems.forEach((row) => {
      if (!orderMap.has(row.orderId)) {
        orderMap.set(row.orderId, {
          id: row.orderId,
          orderNumber: row.orderNumber,
          organizationId: row.organizationId,
          totalAmount: row.orderTotalAmount,
          status: row.orderStatus as RegistrationOrderDto['status'],
          createdAt: row.orderCreatedAt,
          updatedAt: row.orderUpdatedAt,
          items: [],
          payments: [],
          invoices: []
        });
      }

      const orderDto = orderMap.get(row.orderId)!;

      // Add item if it exists and not already added
      if (row.itemId && !orderDto.items.find(item => item.id === row.itemId)) {
        orderDto.items.push({
          id: row.itemId,
          productName: row.productName || 'Unknown Product',
          productCategory: row.productCategoryName || 'Unknown Category',
          quantity: row.itemQuantity || 0,
          unitPrice: row.itemUnitPrice || 0,
          totalPrice: row.itemTotalPrice || 0
        });
      }
    });

    // Add payments to orders
    payments.forEach((payment) => {
      const orderDto = orderMap.get(payment.orderId);
      if (orderDto) {
        orderDto.payments.push({
          id: payment.paymentId,
          amount: payment.amount,
          paymentDate: payment.paymentDate || new Date(),
          method: payment.method || '',
          status: payment.status
        });
      }
    });

    // Add invoices to orders
    invoices.forEach((invoice) => {
      const orderDto = orderMap.get(invoice.orderId);
      if (orderDto) {
        orderDto.invoices.push({
          id: invoice.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.invoiceStatus,
          totalAmount: invoice.invoiceTotalAmount,
          paidAmount: invoice.invoicePaidAmount,
          balanceOwed: invoice.invoiceBalanceOwed
        });
      }
    });

    return Array.from(orderMap.values());
  } catch (error) {
    console.error('Error fetching registration orders:', error);
    throw new Error('Failed to fetch registration orders');
  }
});