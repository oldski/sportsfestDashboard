'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and } from '@workspace/database/client';
import { orderTable, eventYearTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface RevenueStatsResult {
  totalRevenue: number;
  priorYearRevenue: number | null;
  growthRate: number | null;
  currentYear: number | null;
  priorYear: number | null;
}

export async function getRevenueStats(): Promise<RevenueStatsResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access revenue stats');
  }

  try {
    const currentEventYear = await getCurrentEventYear();

    if (!currentEventYear) {
      return {
        totalRevenue: 0,
        priorYearRevenue: null,
        growthRate: null,
        currentYear: null,
        priorYear: null,
      };
    }

    // Get current year revenue
    const currentResult = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orderTable.totalAmount}), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .where(and(
        eq(orderTable.eventYearId, currentEventYear.id as string),
        sql`${orderTable.status} IN ('confirmed', 'deposit_paid', 'fully_paid')`
      ));

    const totalRevenue = currentResult[0]?.totalRevenue || 0;

    // Try to get prior year for comparison
    const priorYearResult = await db
      .select({
        id: eventYearTable.id,
        year: eventYearTable.year,
      })
      .from(eventYearTable)
      .where(and(
        eq(eventYearTable.year, (currentEventYear.year as number) - 1),
        eq(eventYearTable.isDeleted, false)
      ))
      .limit(1);

    let priorYearRevenue: number | null = null;
    let growthRate: number | null = null;
    let priorYear: number | null = null;

    if (priorYearResult.length > 0) {
      const priorEventYear = priorYearResult[0];
      priorYear = priorEventYear.year;

      const priorResult = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${orderTable.totalAmount}), 0)`.mapWith(Number),
        })
        .from(orderTable)
        .where(and(
          eq(orderTable.eventYearId, priorEventYear.id),
          sql`${orderTable.status} IN ('confirmed', 'deposit_paid', 'fully_paid')`
        ));

      priorYearRevenue = priorResult[0]?.totalRevenue || 0;

      // Calculate growth rate
      if (priorYearRevenue > 0) {
        growthRate = ((totalRevenue - priorYearRevenue) / priorYearRevenue) * 100;
      } else if (totalRevenue > 0) {
        growthRate = 100; // 100% growth if prior year was 0
      }
    }

    return {
      totalRevenue,
      priorYearRevenue,
      growthRate,
      currentYear: currentEventYear.year as number,
      priorYear,
    };
  } catch (error) {
    console.error('Failed to get revenue stats:', error);
    return {
      totalRevenue: 0,
      priorYearRevenue: null,
      growthRate: null,
      currentYear: null,
      priorYear: null,
    };
  }
}
