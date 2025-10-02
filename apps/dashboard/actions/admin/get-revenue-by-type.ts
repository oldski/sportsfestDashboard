'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql, eq } from '@workspace/database/client';
import { orderTable, orderItemTable, productTable, eventYearTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface RevenueByTypeData {
  type: string;
  amount: number;
}

export async function getRevenueByType(): Promise<RevenueByTypeData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access revenue by type data');
  }

  try {
    // Get current active event year
    const currentEventYear = await db
      .select({ id: eventYearTable.id })
      .from(eventYearTable)
      .where(eq(eventYearTable.isActive, true))
      .orderBy(eventYearTable.createdAt)
      .limit(1);

    const currentEventYearId = currentEventYear[0]?.id;

    if (!currentEventYearId) {
      console.warn('No active event year found');
      return [];
    }

    // Query revenue by product type from actual order data
    const revenueData = await db.execute(sql`
      SELECT
        p.type as product_type,
        COALESCE(SUM(oi.quantity * oi."unitPrice"), 0) as total_revenue
      FROM "orderItem" oi
      JOIN "order" o ON oi."orderId" = o.id
      JOIN product p ON oi."productId" = p.id
      WHERE o.status IN ('deposit_paid', 'fully_paid')
        AND o."eventYearId" = ${currentEventYearId}
      GROUP BY p.type
      ORDER BY total_revenue DESC
    `);

    const revenueByType: RevenueByTypeData[] = (revenueData as any).rows.map((row: any) => ({
      type: row.product_type?.replace('_', ' ').toUpperCase() || 'UNKNOWN',
      amount: Math.round(Number(row.total_revenue || 0))
    })).filter((item: RevenueByTypeData) => item.amount > 0);

    // If no data found, return empty array
    if (revenueByType.length === 0) {
      console.log('No revenue data found for current event year');
      return [];
    }

    return revenueByType;

  } catch (error) {
    console.error('Failed to get revenue by type data:', error);

    // Return empty array instead of mock data to show real state
    return [];
  }
}