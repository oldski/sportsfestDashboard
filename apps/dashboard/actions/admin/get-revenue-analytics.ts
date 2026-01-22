'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import { orderTable, orderItemTable, productTable, ProductType, OrderStatus } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface RevenueByProductData {
  productType: string;
  displayName: string;
  amount: number;
}

export interface RevenueAnalyticsResult {
  byProductType: RevenueByProductData[];
  netRevenue: number;
}

const PRODUCT_TYPE_DISPLAY_NAMES: Record<string, string> = {
  [ProductType.TEAM_REGISTRATION]: 'Team Registration',
  [ProductType.TENT_RENTAL]: 'Tent Rentals',
  [ProductType.MERCHANDISE]: 'Merchandise',
  [ProductType.EQUIPMENT]: 'Equipment',
  [ProductType.SERVICES]: 'Services',
};

export async function getRevenueAnalytics(eventYearId?: string): Promise<RevenueAnalyticsResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access revenue analytics');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    if (!targetEventYearId) {
      return { byProductType: [], netRevenue: 0 };
    }

    // Only include orders that have actually paid (not just confirmed)
    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];

    // Query revenue by product type (excluding sponsorship orders)
    // Calculate proportional revenue based on line item contribution to order total
    const revenueByType = await db
      .select({
        productType: productTable.type,
        // Calculate the paid portion of each line item:
        // (lineItemTotal / orderTotal) * (orderTotal - balanceOwed)
        totalAmount: sql<number>`
          COALESCE(SUM(
            CASE
              WHEN ${orderTable.totalAmount} > 0
              THEN (${orderItemTable.totalPrice} / ${orderTable.totalAmount}) * (${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0))
              ELSE 0
            END
          ), 0)
        `.mapWith(Number),
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses),
          eq(orderTable.isSponsorship, false)
        )
      )
      .groupBy(productTable.type);

    // Query sponsorship revenue separately
    const sponsorshipRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0)), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses),
          eq(orderTable.isSponsorship, true)
        )
      );

    const sponsorshipRevenue = sponsorshipRevenueResult[0]?.total || 0;

    // Transform to display format
    const byProductType: RevenueByProductData[] = revenueByType
      .filter(item => item.totalAmount > 0)
      .map(item => ({
        productType: item.productType,
        displayName: PRODUCT_TYPE_DISPLAY_NAMES[item.productType] || item.productType,
        amount: Math.round(item.totalAmount * 100) / 100, // Round to 2 decimal places
      }))
      .sort((a, b) => b.amount - a.amount);

    // Add sponsorship revenue if any
    if (sponsorshipRevenue > 0) {
      byProductType.push({
        productType: 'sponsorship',
        displayName: 'Sponsorships',
        amount: Math.round(sponsorshipRevenue * 100) / 100,
      });
      // Re-sort after adding sponsorships
      byProductType.sort((a, b) => b.amount - a.amount);
    }

    // Calculate net revenue directly from order totals (same as get-revenue-stats.ts)
    // This ensures consistency between revenue analytics and revenue stats
    const netRevenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0)), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses)
        )
      );

    const netRevenue = netRevenueResult[0]?.total || 0;

    // Calculate attributed revenue (sum of product type breakdown including sponsorships)
    const attributedRevenue = byProductType.reduce((sum, item) => sum + item.amount, 0);

    // Add "Other" category for any remaining unattributed revenue
    const unattributedRevenue = Math.round((netRevenue - attributedRevenue) * 100) / 100;
    if (unattributedRevenue > 0) {
      byProductType.push({
        productType: 'other',
        displayName: 'Other',
        amount: unattributedRevenue,
      });
    }

    return {
      byProductType,
      netRevenue: Math.round(netRevenue * 100) / 100,
    };
  } catch (error) {
    console.error('Failed to get revenue analytics:', error);
    return {
      byProductType: [],
      netRevenue: 0,
    };
  }
}
