'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import { orderTable, OrderStatus } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface RevenueProgressionData {
  date: string;
  cumulative: number;
}

export async function getRevenueProgression(eventYearId?: string): Promise<RevenueProgressionData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access revenue progression data');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    if (!targetEventYearId) {
      return [];
    }

    // Only include orders that have actually paid
    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];

    // Get daily revenue (actual collected: totalAmount - balanceOwed)
    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${orderTable.updatedAt})`.as('date'),
        amount: sql<number>`COALESCE(SUM(${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0)), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses)
        )
      )
      .groupBy(sql`DATE(${orderTable.updatedAt})`)
      .orderBy(sql`DATE(${orderTable.updatedAt}) ASC`);

    if (dailyRevenue.length === 0) {
      return [];
    }

    // Convert to cumulative totals
    let cumulative = 0;
    const progressionData: RevenueProgressionData[] = dailyRevenue.map((row) => {
      cumulative += row.amount;
      const dateObj = new Date(row.date);
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumulative: Math.round(cumulative * 100) / 100,
      };
    });

    return progressionData;
  } catch (error) {
    console.error('Failed to get revenue progression:', error);
    return [];
  }
}
