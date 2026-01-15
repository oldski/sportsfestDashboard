'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and } from '@workspace/database/client';
import { orderTable, orderItemTable, product, ProductType } from '@workspace/database/schema';

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

    // Build the where clause
    const whereClause = targetEventYearId
      ? and(
          eq(orderTable.eventYearId, targetEventYearId),
          sql`${orderTable.status} IN ('confirmed', 'deposit_paid', 'fully_paid')`
        )
      : sql`${orderTable.status} IN ('confirmed', 'deposit_paid', 'fully_paid')`;

    // Query revenue by product type
    const revenueByType = await db
      .select({
        productType: product.type,
        totalAmount: sql<number>`COALESCE(SUM(${orderItemTable.totalPrice}), 0)`.mapWith(Number),
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(product, eq(orderItemTable.productId, product.id))
      .where(whereClause)
      .groupBy(product.type);

    // Transform to display format
    const byProductType: RevenueByProductData[] = revenueByType
      .filter(item => item.totalAmount > 0)
      .map(item => ({
        productType: item.productType,
        displayName: PRODUCT_TYPE_DISPLAY_NAMES[item.productType] || item.productType,
        amount: item.totalAmount,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate net revenue
    const netRevenue = byProductType.reduce((sum, item) => sum + item.amount, 0);

    return {
      byProductType,
      netRevenue,
    };
  } catch (error) {
    console.error('Failed to get revenue analytics:', error);
    return {
      byProductType: [],
      netRevenue: 0,
    };
  }
}