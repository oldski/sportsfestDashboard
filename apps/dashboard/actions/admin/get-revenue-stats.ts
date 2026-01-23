'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import { orderTable, eventYearTable, OrderStatus } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface RevenueStatsResult {
  totalRevenue: number;
  registrationRevenue: number;
  sponsorshipRevenue: number;
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
        registrationRevenue: 0,
        sponsorshipRevenue: 0,
        priorYearRevenue: null,
        growthRate: null,
        currentYear: null,
        priorYear: null,
      };
    }

    // Only include orders that have actually paid (not just confirmed)
    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];

    // Get current year revenue with registration/sponsorship breakdown
    // For sponsorships, use baseAmount from metadata to exclude processing fee
    const currentResult = await db
      .select({
        registrationRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = false THEN ${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0) ELSE 0 END), 0)`.mapWith(Number),
        // Sponsorship: use baseAmount from metadata, proportionally adjusted for balance owed
        sponsorshipOrdered: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = true THEN COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric, ${orderTable.totalAmount}) ELSE 0 END), 0)`.mapWith(Number),
        sponsorshipBalance: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = true THEN COALESCE(${orderTable.balanceOwed}, 0) * COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric / NULLIF(${orderTable.totalAmount}, 0), 1) ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .where(and(
        eq(orderTable.eventYearId, currentEventYear.id as string),
        inArray(orderTable.status, paidStatuses)
      ));

    const registrationRevenue = currentResult[0]?.registrationRevenue || 0;
    const sponsorshipOrdered = currentResult[0]?.sponsorshipOrdered || 0;
    const sponsorshipBalance = currentResult[0]?.sponsorshipBalance || 0;
    const sponsorshipRevenue = sponsorshipOrdered - sponsorshipBalance;
    const totalRevenue = registrationRevenue + sponsorshipRevenue;

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
          totalRevenue: sql<number>`COALESCE(SUM(${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0)), 0)`.mapWith(Number),
        })
        .from(orderTable)
        .where(and(
          eq(orderTable.eventYearId, priorEventYear.id),
          inArray(orderTable.status, paidStatuses)
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
      registrationRevenue,
      sponsorshipRevenue,
      priorYearRevenue,
      growthRate,
      currentYear: currentEventYear.year as number,
      priorYear,
    };
  } catch (error) {
    console.error('Failed to get revenue stats:', error);
    return {
      totalRevenue: 0,
      registrationRevenue: 0,
      sponsorshipRevenue: 0,
      priorYearRevenue: null,
      growthRate: null,
      currentYear: null,
      priorYear: null,
    };
  }
}
