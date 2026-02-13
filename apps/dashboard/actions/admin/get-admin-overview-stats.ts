'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql, eq } from '@workspace/database/client';
import { tentPurchaseTrackingTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface AdminOverviewStats {
  totalCompanies: number;
  newCompaniesThisMonth: number;
  totalPlayers: number;
  newPlayersThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalTentRentals: number;
  tentUtilizationRate: number;
  // Additional tent tracking data
  tentQuotaMet: number;
  totalTentPurchases: number;
  availableTents: number;
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access admin statistics');
  }

  // Calculate first day of current month for monthly stats
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const firstDayISO = firstDayOfMonth.toISOString();

  // First, get the current event year ID
  let currentEventYearId;
  try {
    const currentEventYear = await db.execute(sql`
      SELECT id FROM "eventYear"
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);
    currentEventYearId = (currentEventYear as any)?.rows?.[0]?.id;
  } catch (error) {
    console.error('Could not fetch current event year:', error);
  }

  // Get company team purchase statistics for the current event year
  let companyStats;
  try {
    companyStats = await db.execute(sql`
      SELECT
        COUNT(*) as total_companies,
        COUNT(*) FILTER (WHERE "createdAt" >= ${firstDayISO}::timestamp) as new_companies_this_month
      FROM "companyTeam"
      WHERE "isPaid" = true
        AND "eventYearId" = ${currentEventYearId}
    `);
  } catch (error) {
    console.error('Error querying companyTeam table:', error);
    companyStats = [{ total_companies: 0, new_companies_this_month: 0 }];
  }

  // Get player statistics from player table directly
  let playerStats;
  try {
    playerStats = await db.execute(sql`
      SELECT
        COUNT(*) as total_players,
        COUNT(*) FILTER (WHERE "createdAt" >= ${firstDayISO}::timestamp) as new_players_this_month
      FROM player
    `);
  } catch (error) {
    playerStats = [{ total_players: 0, new_players_this_month: 0 }];
  }

  // Get tent rental statistics from orders table
  let tentStats;
  try {
    tentStats = await db.execute(sql`
      SELECT
        COUNT(DISTINCT o.id) as total_tent_purchases,
        COUNT(DISTINCT o."organizationId") as unique_orgs_with_tents
      FROM "order" o
      JOIN "orderItem" oi ON o.id = oi."orderId"
      JOIN product p ON oi."productId" = p.id
      WHERE o.status IN ('deposit_paid', 'fully_paid')
        AND p.type = 'tent_rental'
        AND o."eventYearId" = ${currentEventYearId}
    `);
  } catch (error) {
    console.warn('Tent rental query failed:', error);
    tentStats = { rows: [{ total_tent_purchases: 0, unique_orgs_with_tents: 0 }] };
  }

  // Get order statistics for revenue (exclude remaining deposit balances)
  let revenueStats;
  try {
    revenueStats = await db.execute(sql`
      SELECT
        COALESCE(SUM("totalAmount" - COALESCE("balanceOwed", 0)), 0) as total_revenue,
        COALESCE(SUM(
          CASE
            WHEN "createdAt" >= ${firstDayISO}::timestamp
            THEN ("totalAmount" - COALESCE("balanceOwed", 0))
            ELSE 0
          END
        ), 0) as revenue_this_month
      FROM "order"
      WHERE status IN ('deposit_paid', 'fully_paid')
        AND "eventYearId" = ${currentEventYearId}
    `);
  } catch (error) {
    console.warn('Revenue query failed:', error);
    revenueStats = { rows: [{ total_revenue: 0, revenue_this_month: 0 }] };
  }

  // Get membership count for better organization tracking (fallback for players)
  const membershipStats = await db.execute(sql`
    SELECT COUNT(*) as total_memberships
    FROM membership
  `);

  const companyRow = (companyStats as any)?.rows?.[0];
  const playerRow = (playerStats as any)?.rows?.[0];
  const tentRow = (tentStats as any)?.rows?.[0];
  const revenueRow = (revenueStats as any)?.rows?.[0];
  const membershipRow = (membershipStats as any)?.rows?.[0];


  // Use actual players from player table, fallback to memberships if no players
  const totalPlayers = Number(playerRow?.total_players || membershipRow?.total_memberships || 0);
  const newPlayersThisMonth = Number(playerRow?.new_players_this_month || 0);

  // Get total tent inventory for utilization calculation
  let tentInventoryTotal = 0;
  try {
    // Get tent inventory using new soldcount and reservedcount columns
    const tentInventory = await db.execute(sql`
      SELECT
        COALESCE(SUM("totalInventory"), 0) as total_tent_inventory,
        COALESCE(SUM(soldcount), 0) as total_tent_sold,
        COALESCE(SUM(reservedcount), 0) as total_tent_reserved,
        COALESCE(SUM("totalInventory" - soldcount - reservedcount), 0) as total_tent_available
      FROM product
      WHERE type = 'tent_rental'
        AND "eventYearId" = ${currentEventYearId}
    `);
    const inventoryData = (tentInventory as any)?.rows?.[0];
    tentInventoryTotal = Number(inventoryData?.total_tent_inventory || 0);

  } catch (error) {
    console.warn('Could not fetch tent inventory:', error);
  }

  // Get tent tracking statistics from tentPurchaseTrackingTable
  let tentTrackingStats;
  try {
    const tentTracking = await db
      .select({
        totalPurchases: sql<number>`COUNT(*)`,
        // Orgs at quota: where tents purchased >= companyTeamCount * 2 (2 tents per team)
        quotaMet: sql<number>`COUNT(*) FILTER (WHERE "quantityPurchased" >= "companyTeamCount" * 2)`,
        totalQuantityPurchased: sql<number>`COALESCE(SUM("quantityPurchased"), 0)`
      })
      .from(tentPurchaseTrackingTable)
      .where(currentEventYearId ? eq(tentPurchaseTrackingTable.eventYearId, currentEventYearId) : sql`1=1`);

    tentTrackingStats = tentTracking[0] || { totalPurchases: 0, quotaMet: 0, totalQuantityPurchased: 0 };
  } catch (error) {
    console.warn('Could not fetch tent tracking data:', error);
    tentTrackingStats = { totalPurchases: 0, quotaMet: 0, totalQuantityPurchased: 0 };
  }

  // Use tent tracking data for more detailed metrics
  const tentTrackingPurchases = Number(tentTrackingStats?.totalPurchases || 0);
  const tentQuotaMet = Number(tentTrackingStats?.quotaMet || 0);
  const totalQuantityFromTracking = Number(tentTrackingStats?.totalQuantityPurchased || 0);

  // Calculate tent utilization based on actual quantity purchased (not order count)
  const tentUtilizationRate = tentInventoryTotal > 0
    ? Math.round((totalQuantityFromTracking / tentInventoryTotal) * 100)
    : 0;

  // Calculate available tents based on inventory minus sold/reserved
  const availableTents = Math.max(0, tentInventoryTotal - totalQuantityFromTracking);

  return {
    totalCompanies: Number(companyRow?.total_companies || 0),
    newCompaniesThisMonth: Number(companyRow?.new_companies_this_month || 0),
    totalPlayers: totalPlayers,
    newPlayersThisMonth: newPlayersThisMonth,
    totalRevenue: Number(revenueRow?.total_revenue || 0),
    revenueThisMonth: Number(revenueRow?.revenue_this_month || 0),
    totalTentRentals: totalQuantityFromTracking, // Use actual quantity, not order count
    tentUtilizationRate: Math.min(tentUtilizationRate, 100), // Cap at 100%
    // Additional tent tracking data
    tentQuotaMet: tentQuotaMet,
    totalTentPurchases: tentTrackingPurchases,
    availableTents: availableTents
  };
}
