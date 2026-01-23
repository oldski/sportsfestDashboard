'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray, or, like } from '@workspace/database/client';
import {
  organizationTable,
  orderTable,
  orderItemTable,
  productTable,
  playerTable,
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
  registrationRevenue: number;  // Revenue from team registrations and tents (non-sponsorship)
  sponsorshipRevenue: number;   // Revenue from sponsorship orders
  totalRevenue: number;         // Combined total
  balanceOwed: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'none';
  isSponsor: boolean;
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

    // Get team counts by organization from order items (includes WooCommerce imports)
    // This counts teams from paid orders by looking at product names containing "team"
    const teamCounts = await db
      .select({
        organizationId: orderTable.organizationId,
        count: sql<number>`COALESCE(SUM(${orderItemTable.quantity}), 0)`.mapWith(Number),
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses),
          // Only count team products (case-insensitive match)
          or(
            like(sql`LOWER(${productTable.name})`, '%team%'),
            like(sql`LOWER(${productTable.name})`, '%company team%')
          )
        )
      )
      .groupBy(orderTable.organizationId);

    const teamCountMap = new Map(teamCounts.map(t => [t.organizationId, t.count]));

    // Get revenue and balance by organization (only paid orders), split by sponsorship
    // For sponsorship orders, use baseAmount from metadata (excludes processing fee)
    const orderStats = await db
      .select({
        organizationId: orderTable.organizationId,
        // Total registration revenue (non-sponsorship orders)
        registrationOrdered: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = false THEN ${orderTable.totalAmount} ELSE 0 END), 0)`.mapWith(Number),
        registrationBalance: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = false THEN COALESCE(${orderTable.balanceOwed}, 0) ELSE 0 END), 0)`.mapWith(Number),
        // Total sponsorship revenue (use baseAmount from metadata to exclude processing fee)
        sponsorshipOrdered: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = true THEN COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric, ${orderTable.totalAmount}) ELSE 0 END), 0)`.mapWith(Number),
        // For sponsorship balance, calculate proportionally based on base amount vs total
        sponsorshipBalance: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.isSponsorship} = true THEN COALESCE(${orderTable.balanceOwed}, 0) * COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric / NULLIF(${orderTable.totalAmount}, 0), 1) ELSE 0 END), 0)`.mapWith(Number),
        // Flag if they have any sponsorship orders
        hasSponsorshipOrders: sql<boolean>`BOOL_OR(${orderTable.isSponsorship} = true)`,
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

      // Registration revenue (non-sponsorship)
      const registrationOrdered = orderStat?.registrationOrdered || 0;
      const registrationBalance = orderStat?.registrationBalance || 0;
      const registrationRevenue = registrationOrdered - registrationBalance;

      // Sponsorship revenue
      const sponsorshipOrdered = orderStat?.sponsorshipOrdered || 0;
      const sponsorshipBalance = orderStat?.sponsorshipBalance || 0;
      const sponsorshipRevenue = sponsorshipOrdered - sponsorshipBalance;

      // Combined totals
      const totalOrdered = registrationOrdered + sponsorshipOrdered;
      const balanceOwed = registrationBalance + sponsorshipBalance;
      const totalRevenue = registrationRevenue + sponsorshipRevenue;

      // Check if org is a sponsor (has any sponsorship orders)
      const isSponsor = orderStat?.hasSponsorshipOrders || false;

      let paymentStatus: CompanyLeaderboardData['paymentStatus'] = 'none';
      if (totalOrdered > 0) {
        if (balanceOwed === 0) {
          paymentStatus = 'paid';
        } else if (totalRevenue > 0) {
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
        registrationRevenue: Math.round(registrationRevenue * 100) / 100,
        sponsorshipRevenue: Math.round(sponsorshipRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        balanceOwed: Math.round(balanceOwed * 100) / 100,
        paymentStatus,
        isSponsor,
      };
    });

    // Sort by collected revenue descending
    return leaderboard.sort((a, b) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    console.error('Failed to get company leaderboard:', error);
    return [];
  }
}
