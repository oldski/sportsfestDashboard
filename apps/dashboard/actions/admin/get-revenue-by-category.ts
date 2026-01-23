'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import {
  orderTable,
  orderItemTable,
  productTable,
  OrderStatus,
  ProductType
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface RevenueByCategoryData {
  month: string;
  sponsorships: number;
  companyTeams: number;
  tentRentals: number;
}

export interface RevenueByCategoryResult {
  data: RevenueByCategoryData[];
  totals: {
    sponsorships: number;
    companyTeams: number;
    tentRentals: number;
  };
}

export async function getRevenueByCategory(): Promise<RevenueByCategoryResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access revenue data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();

    if (!currentEventYear) {
      return {
        data: [],
        totals: { sponsorships: 0, companyTeams: 0, tentRentals: 0 }
      };
    }

    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];

    // Get sponsorship revenue by month (use baseAmount from metadata to exclude processing fee)
    const sponsorshipRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM')`.as('month'),
        amount: sql<number>`COALESCE(SUM(
          COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric, ${orderTable.totalAmount})
          - COALESCE(${orderTable.balanceOwed}, 0) * COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric / NULLIF(${orderTable.totalAmount}, 0), 1)
        ), 0)`.mapWith(Number)
      })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.eventYearId, currentEventYear.id as string),
          eq(orderTable.isSponsorship, true),
          inArray(orderTable.status, paidStatuses)
        )
      )
      .groupBy(sql`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM') ASC`);

    // Get team registration revenue by month (from order items with team_registration products)
    const teamRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM')`.as('month'),
        amount: sql<number>`COALESCE(SUM(${orderItemTable.totalPrice}), 0)`.mapWith(Number)
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, currentEventYear.id as string),
          eq(productTable.type, ProductType.TEAM_REGISTRATION),
          eq(orderTable.isSponsorship, false),
          inArray(orderTable.status, paidStatuses)
        )
      )
      .groupBy(sql`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM') ASC`);

    // Get tent rental revenue by month (from order items with tent_rental products)
    const tentRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM')`.as('month'),
        amount: sql<number>`COALESCE(SUM(${orderItemTable.totalPrice}), 0)`.mapWith(Number)
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, currentEventYear.id as string),
          eq(productTable.type, ProductType.TENT_RENTAL),
          eq(orderTable.isSponsorship, false),
          inArray(orderTable.status, paidStatuses)
        )
      )
      .groupBy(sql`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orderTable.updatedAt}, 'YYYY-MM') ASC`);

    // Combine all months and create cumulative data
    const allMonths = new Set<string>();
    sponsorshipRevenue.forEach(r => allMonths.add(r.month));
    teamRevenue.forEach(r => allMonths.add(r.month));
    tentRevenue.forEach(r => allMonths.add(r.month));

    const sortedMonths = Array.from(allMonths).sort();

    // Create lookup maps for each category
    const sponsorshipMap = new Map(sponsorshipRevenue.map(r => [r.month, r.amount]));
    const teamMap = new Map(teamRevenue.map(r => [r.month, r.amount]));
    const tentMap = new Map(tentRevenue.map(r => [r.month, r.amount]));

    // Build cumulative data
    let cumulativeSponsorships = 0;
    let cumulativeTeams = 0;
    let cumulativeTents = 0;

    const data: RevenueByCategoryData[] = sortedMonths.map(month => {
      cumulativeSponsorships += sponsorshipMap.get(month) || 0;
      cumulativeTeams += teamMap.get(month) || 0;
      cumulativeTents += tentMap.get(month) || 0;

      // Format month for display (e.g., "2026-01" -> "Jan 2026")
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      const formattedMonth = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      return {
        month: formattedMonth,
        sponsorships: Math.round(cumulativeSponsorships * 100) / 100,
        companyTeams: Math.round(cumulativeTeams * 100) / 100,
        tentRentals: Math.round(cumulativeTents * 100) / 100
      };
    });

    return {
      data,
      totals: {
        sponsorships: Math.round(cumulativeSponsorships * 100) / 100,
        companyTeams: Math.round(cumulativeTeams * 100) / 100,
        tentRentals: Math.round(cumulativeTents * 100) / 100
      }
    };
  } catch (error) {
    console.error('Failed to get revenue by category:', error);
    return {
      data: [],
      totals: { sponsorships: 0, companyTeams: 0, tentRentals: 0 }
    };
  }
}
