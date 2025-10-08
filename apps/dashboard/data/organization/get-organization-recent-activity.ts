import 'server-only';

import { unstable_cache as cache } from 'next/cache';
import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, desc, or, sql } from '@workspace/database/client';
import {
  orderTable,
  orderPaymentTable,
  orderInvoiceTable,
  OrderStatus,
  PaymentStatus
} from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';

export interface ActivityItem {
  id: string;
  type: 'order_created' | 'payment_received' | 'invoice_sent' | 'registration_started';
  title: string;
  description: string;
  amount?: number;
  createdAt: Date;
  icon: 'package' | 'dollar-sign' | 'file-text' | 'trending-up';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export async function getOrganizationRecentActivity(limit: number = 5): Promise<ActivityItem[]> {
  const ctx = await getAuthOrganizationContext();

  return cache(
    async () => {
      const activities: ActivityItem[] = [];

      // Get recent orders
      const recentOrders = await db
        .select({
          id: orderTable.id,
          orderNumber: orderTable.orderNumber,
          totalAmount: orderTable.totalAmount,
          status: orderTable.status,
          createdAt: orderTable.createdAt
        })
        .from(orderTable)
        .where(eq(orderTable.organizationId, ctx.organization.id))
        .orderBy(desc(orderTable.createdAt))
        .limit(10);

      // Add order activities
      recentOrders.forEach(order => {
        // Add order creation activity
        activities.push({
          id: `order-${order.id}`,
          type: 'order_created',
          title: 'Order Created',
          description: `Order #${order.orderNumber} - $${order.totalAmount.toFixed(2)}`,
          amount: order.totalAmount,
          createdAt: order.createdAt,
          icon: 'package',
          color: 'blue'
        });

        // If this is the first order, add registration started activity
        if (recentOrders.indexOf(order) === recentOrders.length - 1) {
          activities.push({
            id: `registration-${order.id}`,
            type: 'registration_started',
            title: 'Registration Started',
            description: 'Welcome to SportsFest 2025!',
            createdAt: order.createdAt,
            icon: 'trending-up',
            color: 'purple'
          });
        }
      });

      // Get recent payments
      const recentPayments = await db
        .select({
          id: orderPaymentTable.id,
          amount: orderPaymentTable.amount,
          status: orderPaymentTable.status,
          createdAt: orderPaymentTable.createdAt,
          orderNumber: orderTable.orderNumber
        })
        .from(orderPaymentTable)
        .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
        .where(
          and(
            eq(orderTable.organizationId, ctx.organization.id),
            eq(orderPaymentTable.status, PaymentStatus.COMPLETED)
          )
        )
        .orderBy(desc(orderPaymentTable.createdAt))
        .limit(5);

      // Add payment activities
      recentPayments.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment_received',
          title: 'Payment Received',
          description: `Order #${payment.orderNumber} - $${payment.amount.toFixed(2)}`,
          amount: payment.amount,
          createdAt: payment.createdAt,
          icon: 'dollar-sign',
          color: 'green'
        });
      });

      // Get recent invoices
      const recentInvoices = await db
        .select({
          id: orderInvoiceTable.id,
          invoiceNumber: orderInvoiceTable.invoiceNumber,
          totalAmount: orderInvoiceTable.totalAmount,
          sentAt: orderInvoiceTable.sentAt,
          createdAt: orderInvoiceTable.createdAt
        })
        .from(orderInvoiceTable)
        .innerJoin(orderTable, eq(orderInvoiceTable.orderId, orderTable.id))
        .where(
          and(
            eq(orderTable.organizationId, ctx.organization.id),
            // Only include invoices that have been sent
            sql`${orderInvoiceTable.sentAt} IS NOT NULL`
          )
        )
        .orderBy(desc(orderInvoiceTable.sentAt))
        .limit(3);

      // Add invoice activities
      recentInvoices.forEach(invoice => {
        if (invoice.sentAt) {
          activities.push({
            id: `invoice-${invoice.id}`,
            type: 'invoice_sent',
            title: 'Invoice Sent',
            description: `Invoice #${invoice.invoiceNumber} - $${invoice.totalAmount.toFixed(2)}`,
            amount: invoice.totalAmount,
            createdAt: invoice.sentAt,
            icon: 'file-text',
            color: 'orange'
          });
        }
      });

      // Sort all activities by date and limit
      return activities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.RecentActivity, 
      ctx.organization.id,
      'v1'
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.RecentActivity,
          ctx.organization.id
        )
      ]
    }
  )();
}