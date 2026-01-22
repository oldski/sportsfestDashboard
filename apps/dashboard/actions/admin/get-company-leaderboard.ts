'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import {
  organizationTable,
  orderTable,
  playerTable,
  companyTeamTable,
  OrderStatus
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface CompanyLeaderboardData {
  id: string;
  name: string;
  playerCount: number;
  teamCount: number;
  totalRevenue: number;
  balanceOwed: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'none';
}

export async function getCompanyLeaderboard(eventYearId?: string): Promise<CompanyLeaderboardData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access company leaderboard data');
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

    // Only include orders that have actually paid (not just confirmed)
    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];

    // Get player counts by organization
    const playerCounts = await db
      .select({
        organizationId: playerTable.organizationId,
        count: sql<number>`COUNT(${playerTable.id})`.mapWith(Number),
      })
      .from(playerTable)
      .where(eq(playerTable.eventYearId, targetEventYearId))
      .groupBy(playerTable.organizationId);

    const playerCountMap = new Map(playerCounts.map(p => [p.organizationId, p.count]));

    // Get team counts by organization
    const teamCounts = await db
      .select({
        organizationId: companyTeamTable.organizationId,
        count: sql<number>`COUNT(${companyTeamTable.id})`.mapWith(Number),
      })
      .from(companyTeamTable)
      .where(eq(companyTeamTable.eventYearId, targetEventYearId))
      .groupBy(companyTeamTable.organizationId);

    const teamCountMap = new Map(teamCounts.map(t => [t.organizationId, t.count]));

    // Get revenue and balance by organization (only paid orders)
    const orderStats = await db
      .select({
        organizationId: orderTable.organizationId,
        totalOrdered: sql<number>`COALESCE(SUM(${orderTable.totalAmount}), 0)`.mapWith(Number),
        balanceOwed: sql<number>`COALESCE(SUM(COALESCE(${orderTable.balanceOwed}, 0)), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses)
        )
      )
      .groupBy(orderTable.organizationId);

    const orderStatsMap = new Map(orderStats.map(o => [o.organizationId, o]));

    // Get all organizations with activity
    const activeOrgIds = new Set([
      ...playerCountMap.keys(),
      ...teamCountMap.keys(),
      ...orderStatsMap.keys(),
    ]);

    if (activeOrgIds.size === 0) {
      return [];
    }

    // Get organization names
    const organizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
      })
      .from(organizationTable)
      .where(inArray(organizationTable.id, Array.from(activeOrgIds)));

    // Build leaderboard
    const leaderboard: CompanyLeaderboardData[] = organizations.map(org => {
      const orderStat = orderStatsMap.get(org.id);
      const totalOrdered = orderStat?.totalOrdered || 0;
      const balanceOwed = orderStat?.balanceOwed || 0;
      // Revenue = actual collected amount (totalOrdered - balanceOwed)
      const collectedRevenue = totalOrdered - balanceOwed;

      let paymentStatus: CompanyLeaderboardData['paymentStatus'] = 'none';
      if (totalOrdered > 0) {
        if (balanceOwed === 0) {
          paymentStatus = 'paid';
        } else if (collectedRevenue > 0) {
          paymentStatus = 'partial';
        } else {
          paymentStatus = 'unpaid';
        }
      }

      return {
        id: org.id,
        name: org.name,
        playerCount: playerCountMap.get(org.id) || 0,
        teamCount: teamCountMap.get(org.id) || 0,
        totalRevenue: Math.round(collectedRevenue * 100) / 100,
        balanceOwed: Math.round(balanceOwed * 100) / 100,
        paymentStatus,
      };
    });

    // Sort by collected revenue descending
    return leaderboard.sort((a, b) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    console.error('Failed to get company leaderboard:', error);
    return [];
  }
}
