import 'server-only';

import { unstable_cache as cache } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, desc, eq, and, inArray } from '@workspace/database/client';
import { 
  orderInvoiceTable,
  orderTable,
  orderItemTable,
  productTable
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
          }
        })
        .from(orderInvoiceTable)
        .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
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

      // Group order items by orderId
      const orderItemsMap = new Map<string, typeof allOrderItems>();
      allOrderItems.forEach(item => {
        if (!orderItemsMap.has(item.orderId)) {
          orderItemsMap.set(item.orderId, []);
        }
        orderItemsMap.get(item.orderId)!.push(item);
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
          }))
        }
      }));

      return response;
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.RegistrationInvoices, 
      ctx.organization.id
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.RegistrationInvoices,
          ctx.organization.id
        )
      ]
    }
  )();
}