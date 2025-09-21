import 'server-only';

import { unstable_cache as cache } from 'next/cache';
import { getAuthOrganizationContext } from '@workspace/auth/context';
import { db, eq, and, sql } from '@workspace/database/client';
import { 
  orderTable,
  orderPaymentTable,
  orderItemTable,
  productTable,
  eventYearTable,
  OrderStatus,
  PaymentStatus
} from '@workspace/database/schema';

import {
  Caching,
  defaultRevalidateTimeInSeconds,
  OrganizationCacheKey
} from '~/data/caching';

export interface OrganizationRegistrationStats {
  totalOrders: number;
  totalTeams: number;
  totalTents: number;
  totalAmount: number;
  amountPaid: number;
  balanceOwed: number;
  registrationStatus: 'not_started' | 'in_progress' | 'partial_payment' | 'completed';
  progressPercentage: number;
  recentOrders: number;
  activeInvoices: number;
  orderWithBalance?: {
    id: string;
    orderNumber: string;
    balanceOwed: number;
  };
  eventYear: {
    id: string;
    year: number;
    name: string;
  } | null;
}

export async function getOrganizationRegistrationStats(): Promise<OrganizationRegistrationStats> {
  const ctx = await getAuthOrganizationContext();

  return cache(
    async () => {
      // First get the active event year
      const activeEventYearResult = await db
        .select({
          id: eventYearTable.id,
          year: eventYearTable.year,
          name: eventYearTable.name,
        })
        .from(eventYearTable)
        .where(and(
          eq(eventYearTable.isActive, true),
          eq(eventYearTable.isDeleted, false)
        ))
        .limit(1);

      const activeEventYear = activeEventYearResult[0] || null;

      // If no active event year exists, return empty stats
      if (!activeEventYear) {
        return {
          totalOrders: 0,
          totalTeams: 0,
          totalTents: 0,
          totalAmount: 0,
          amountPaid: 0,
          balanceOwed: 0,
          registrationStatus: 'not_started' as const,
          progressPercentage: 0,
          recentOrders: 0,
          activeInvoices: 0,
          eventYear: null
        };
      }

      // Build where condition to filter by organization ID and active event year
      const whereCondition = and(
        eq(orderTable.organizationId, ctx.organization.id),
        eq(orderTable.eventYearId, activeEventYear.id)
      );

      // Get order statistics for the active event year
      const orderStats = await db
        .select({
          totalOrders: sql<number>`COUNT(*)`,
          totalAmount: sql<number>`COALESCE(SUM(${orderTable.totalAmount}), 0)`,
          completedOrders: sql<number>`COUNT(*) FILTER (WHERE ${orderTable.status} = ${OrderStatus.FULLY_PAID})`,
          pendingOrders: sql<number>`COUNT(*) FILTER (WHERE ${orderTable.status} IN (${OrderStatus.PENDING}, ${OrderStatus.DEPOSIT_PAID}))`,
        })
        .from(orderTable)
        .where(whereCondition);

      // Get teams and tents purchased by counting order items by product type
      // Only count from PAID orders (fully paid or deposit paid)
      const itemStats = await db
        .select({
          productName: productTable.name,
          totalQuantity: sql<number>`COALESCE(SUM(${orderItemTable.quantity}), 0)`,
        })
        .from(orderItemTable)
        .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
        .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
        .where(
          and(
            whereCondition,
            // Only count paid orders - teams must be paid for to be usable
            sql`${orderTable.status} IN (${OrderStatus.FULLY_PAID}, ${OrderStatus.DEPOSIT_PAID})`
          )
        )
        .groupBy(productTable.name);

      // Calculate teams and tents from item statistics
      let totalTeams = 0;
      let totalTents = 0;
      
      itemStats.forEach(item => {
        const productName = item.productName.toLowerCase();
        if (productName.includes('team') || productName.includes('company team')) {
          totalTeams += item.totalQuantity;
        } else if (productName.includes('tent') || productName.includes('pavilion')) {
          totalTents += item.totalQuantity;
        }
      });

      // Get payment statistics for the active event year
      const paymentStats = await db
        .select({
          totalPaid: sql<number>`COALESCE(SUM(${orderPaymentTable.amount}), 0)`,
        })
        .from(orderPaymentTable)
        .innerJoin(orderTable, eq(orderPaymentTable.orderId, orderTable.id))
        .where(
          and(
            whereCondition,
            eq(orderPaymentTable.status, PaymentStatus.COMPLETED)
          )
        );

      const stats = orderStats[0];
      const payments = paymentStats[0];
      
      const totalOrders = stats?.totalOrders || 0;
      const totalAmount = stats?.totalAmount || 0;
      const amountPaid = payments?.totalPaid || 0;
      const balanceOwed = totalAmount - amountPaid;
      const completedOrders = stats?.completedOrders || 0;
      const pendingOrders = stats?.pendingOrders || 0;

      // Calculate registration status and progress
      let registrationStatus: OrganizationRegistrationStats['registrationStatus'];
      let progressPercentage: number;

      if (totalOrders === 0) {
        registrationStatus = 'not_started';
        progressPercentage = 0;
      } else if (completedOrders === totalOrders) {
        registrationStatus = 'completed';
        progressPercentage = 100;
      } else if (amountPaid > 0) {
        registrationStatus = 'partial_payment';
        progressPercentage = Math.round((amountPaid / totalAmount) * 100);
      } else {
        registrationStatus = 'in_progress';
        progressPercentage = Math.round((completedOrders / totalOrders) * 100);
      }

      // Get recent activity counts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrderStats = await db
        .select({
          recentOrders: sql<number>`COUNT(*)`,
        })
        .from(orderTable)
        .where(
          and(
            whereCondition,
            sql`${orderTable.createdAt} >= ${thirtyDaysAgo.toISOString()}`
          )
        );

      // Get an order with balance for the pay balance button
      let orderWithBalance: OrganizationRegistrationStats['orderWithBalance'] = undefined;
      if (balanceOwed > 0) {
        const orderWithBalanceResult = await db
          .select({
            id: orderTable.id,
            orderNumber: orderTable.orderNumber,
            totalAmount: orderTable.totalAmount,
          })
          .from(orderTable)
          .where(
            and(
              whereCondition,
              sql`${orderTable.status} IN ('deposit_paid', 'confirmed')`
            )
          )
          .orderBy(sql`${orderTable.createdAt} DESC`)
          .limit(1);

        if (orderWithBalanceResult[0]) {
          // Calculate this specific order's balance by getting its payments
          const orderPayments = await db
            .select({
              totalPaid: sql<number>`COALESCE(SUM(${orderPaymentTable.amount}), 0)`,
            })
            .from(orderPaymentTable)
            .where(eq(orderPaymentTable.orderId, orderWithBalanceResult[0].id));

          const orderTotalPaid = orderPayments[0]?.totalPaid || 0;
          const orderBalance = orderWithBalanceResult[0].totalAmount - orderTotalPaid;

          if (orderBalance > 0) {
            orderWithBalance = {
              id: orderWithBalanceResult[0].id,
              orderNumber: orderWithBalanceResult[0].orderNumber,
              balanceOwed: orderBalance
            };
          }
        }
      }

      return {
        totalOrders,
        totalTeams,
        totalTents,
        totalAmount,
        amountPaid,
        balanceOwed,
        registrationStatus,
        progressPercentage,
        recentOrders: recentOrderStats[0]?.recentOrders || 0,
        activeInvoices: pendingOrders,
        orderWithBalance,
        eventYear: activeEventYear
      };
    },
    Caching.createOrganizationKeyParts(
      OrganizationCacheKey.RegistrationStats, 
      ctx.organization.id,
      'v2'
    ),
    {
      revalidate: defaultRevalidateTimeInSeconds,
      tags: [
        Caching.createOrganizationTag(
          OrganizationCacheKey.RegistrationStats,
          ctx.organization.id
        )
      ]
    }
  )();
}