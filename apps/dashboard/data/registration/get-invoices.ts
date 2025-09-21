import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, desc, eq, and, inArray } from '@workspace/database/client';
import { 
  orderInvoiceTable,
  orderTable,
  orderItemTable,
  orderPaymentTable,
  productTable,
  eventYearTable
} from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';
import type { RegistrationInvoiceDto } from '~/types/dtos/registration-invoice-dto';

export async function getRegistrationInvoices(): Promise<RegistrationInvoiceDto[]> {
  const ctx = await getAuthOrganizationContext();

  return cache(
    async () => {
      // First get all invoices for the organization
      const invoicesWithOrders = await db
        .select({
          invoice: {
            id: orderInvoiceTable.id,
            invoiceNumber: orderInvoiceTable.invoiceNumber,
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
            updatedAt: orderInvoiceTable.updatedAt
          },
          order: {
            id: orderTable.id,
            orderNumber: orderTable.orderNumber,
            totalAmount: orderTable.totalAmount,
            status: orderTable.status,
            createdAt: orderTable.createdAt
          },
          eventYear: {
            id: eventYearTable.id,
            name: eventYearTable.name,
            year: eventYearTable.year
          }
        })
        .from(orderInvoiceTable)
        .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
        .leftJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
        .where(eq(orderTable.organizationId, ctx.organization.id))
        .orderBy(desc(orderInvoiceTable.createdAt));

      // Get order items for all orders in one query
      const orderIds = invoicesWithOrders.map(item => item.order.id);
      
      const allOrderItems = orderIds.length > 0 ? await db
        .select({
          orderId: orderItemTable.orderId,
          id: orderItemTable.id,
          quantity: orderItemTable.quantity,
          unitPrice: orderItemTable.unitPrice,
          totalPrice: orderItemTable.totalPrice,
          productName: productTable.name
        })
        .from(orderItemTable)
        .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
        .where(inArray(orderItemTable.orderId, orderIds))
        : [];

      // Get payment history for all orders using only basic confirmed fields
      const allOrderPayments = orderIds.length > 0 ? await db
        .select({
          orderId: orderPaymentTable.orderId,
          id: orderPaymentTable.id,
          amount: orderPaymentTable.amount,
          createdAt: orderPaymentTable.createdAt
        })
        .from(orderPaymentTable)
        .where(inArray(orderPaymentTable.orderId, orderIds))
        .orderBy(orderPaymentTable.createdAt)
        : [];

      // Group order items by orderId
      const orderItemsMap = new Map<string, typeof allOrderItems>();
      allOrderItems.forEach(item => {
        if (!orderItemsMap.has(item.orderId)) {
          orderItemsMap.set(item.orderId, []);
        }
        orderItemsMap.get(item.orderId)!.push(item);
      });

      // Group order payments by orderId
      const orderPaymentsMap = new Map<string, typeof allOrderPayments>();
      allOrderPayments.forEach(payment => {
        if (!orderPaymentsMap.has(payment.orderId)) {
          orderPaymentsMap.set(payment.orderId, []);
        }
        orderPaymentsMap.get(payment.orderId)!.push(payment);
      });

      // Build the response DTOs
      const response: RegistrationInvoiceDto[] = invoicesWithOrders.map((item) => ({
        id: item.invoice.id,
        invoiceNumber: item.invoice.invoiceNumber,
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        totalAmount: item.invoice.totalAmount,
        paidAmount: item.invoice.paidAmount,
        balanceOwed: item.invoice.balanceOwed,
        status: item.invoice.status as RegistrationInvoiceDto['status'],
        dueDate: item.invoice.dueDate ?? undefined,
        paidAt: item.invoice.paidAt ?? undefined,
        sentAt: item.invoice.sentAt ?? undefined,
        downloadUrl: item.invoice.downloadUrl ?? undefined,
        notes: item.invoice.notes ?? undefined,
        createdAt: item.invoice.createdAt,
        updatedAt: item.invoice.updatedAt,
        eventYear: {
          id: item.eventYear.id || '',
          name: item.eventYear.name || 'Unknown Event Year',
          year: item.eventYear.year || 0
        },
        order: {
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          totalAmount: item.order.totalAmount,
          status: item.order.status,
          createdAt: item.order.createdAt,
          items: (orderItemsMap.get(item.order.id) || []).map(orderItem => ({
            id: orderItem.id,
            productName: orderItem.productName,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
            totalPrice: orderItem.totalPrice
          })),
          payments: (orderPaymentsMap.get(item.order.id) || []).map(payment => ({
            id: payment.id,
            amount: payment.amount,
            method: 'card', // Default for now
            status: 'completed', // Default for now
            paymentDate: payment.createdAt,
            transactionId: undefined, // Not available yet
            paymentType: 'full' as const, // Default for now
            last4: undefined,
            failureReason: undefined
          })) || []
        }
      }));

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.RegistrationInvoices, 
      ctx.organization.id,
      'v2' // Added version to invalidate old cache
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.RegistrationInvoices,
          ctx.organization.id
        ),
        'invoices-v2' // Added version tag to invalidate old cache
      ]
    }
  )();
}