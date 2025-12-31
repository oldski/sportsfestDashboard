import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';

import { db, desc, eq, and, inArray } from '@workspace/database/client';
import { 
  orderTable, 
  orderItemTable, 
  productTable, 
  productCategoryTable,
  orderPaymentTable,
  orderInvoiceTable,
  eventYearTable
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
        orderId: orderTable.id,
        orderNumber: orderTable.orderNumber,
        organizationId: orderTable.organizationId,
        orderTotalAmount: orderTable.totalAmount,
        orderStatus: orderTable.status,
        orderIsSponsorship: orderTable.isSponsorship,
        orderCreatedAt: orderTable.createdAt,
        orderUpdatedAt: orderTable.updatedAt,
        orderMetadata: orderTable.metadata,
        // Event Year fields
        eventYearId: eventYearTable.id,
        eventYearName: eventYearTable.name,
        eventYearYear: eventYearTable.year,
        // Order item fields
        itemId: orderItemTable.id,
        itemQuantity: orderItemTable.quantity,
        itemUnitPrice: orderItemTable.unitPrice,
        itemTotalPrice: orderItemTable.totalPrice,
        // Product fields
        productName: productTable.name,
        productCategoryName: productCategoryTable.name,
      })
      .from(orderTable)
      .leftJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .leftJoin(orderItemTable, eq(orderTable.id, orderItemTable.orderId))
      .leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .leftJoin(productCategoryTable, eq(productTable.categoryId, productCategoryTable.id))
      .where(eq(orderTable.organizationId, organization.id as string))
      .orderBy(desc(orderTable.createdAt));

    // Get payments for all orders
    const orderIds = [...new Set(ordersWithItems.map(row => row.orderId))];
    const payments = orderIds.length > 0 ? await db
      .select({
        orderId: orderPaymentTable.orderId,
        paymentId: orderPaymentTable.id,
        amount: orderPaymentTable.amount,
        paymentDate: orderPaymentTable.processedAt,
        method: orderPaymentTable.paymentMethodType,
        status: orderPaymentTable.status,
      })
      .from(orderPaymentTable)
      .where(inArray(orderPaymentTable.orderId, orderIds))
      : [];

    // Get invoices for all orders
    const invoices = orderIds.length > 0 ? await db
      .select({
        orderId: orderInvoiceTable.orderId,
        invoiceId: orderInvoiceTable.id,
        invoiceNumber: orderInvoiceTable.invoiceNumber,
        invoiceStatus: orderInvoiceTable.status,
        invoiceTotalAmount: orderInvoiceTable.totalAmount,
        invoicePaidAmount: orderInvoiceTable.paidAmount,
        invoiceBalanceOwed: orderInvoiceTable.balanceOwed,
      })
      .from(orderInvoiceTable)
      .where(inArray(orderInvoiceTable.orderId, orderIds))
      : [];

    // Group the data by order
    const orderMap = new Map<string, RegistrationOrderDto>();

    ordersWithItems.forEach((row) => {
      if (!orderMap.has(row.orderId)) {
        // Extract coupon data from metadata
        const metadata = row.orderMetadata as any;
        const appliedCoupon = metadata?.appliedCoupon;
        const couponDiscount = metadata?.couponDiscount || 0;
        const originalTotal = metadata?.originalTotal;

        orderMap.set(row.orderId, {
          id: row.orderId,
          orderNumber: row.orderNumber,
          organizationId: row.organizationId,
          totalAmount: row.orderTotalAmount,
          originalTotal,
          status: row.orderStatus as RegistrationOrderDto['status'],
          isSponsorship: row.orderIsSponsorship,
          createdAt: row.orderCreatedAt,
          updatedAt: row.orderUpdatedAt,
          eventYear: {
            id: row.eventYearId || '',
            name: row.eventYearName || 'Unknown Event Year',
            year: row.eventYearYear || 0
          },
          appliedCoupon,
          couponDiscount,
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