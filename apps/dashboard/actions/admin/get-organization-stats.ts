'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import { organizationTable, orderTable, OrderStatus, membershipTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface OrganizationStatsResult {
  totalOrganizations: number;
  activeOrganizations: number;  // Orgs with orders this year
  newOrganizations: number;     // Orgs created this year
  byRegistrationStatus: {
    status: string;
    displayName: string;
    count: number;
  }[];
}

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.DEPOSIT_PAID]: 'Deposit Paid',
  [OrderStatus.FULLY_PAID]: 'Fully Paid',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUNDED]: 'Refunded',
};

export async function getOrganizationStats(eventYearId?: string): Promise<OrganizationStatsResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access organization stats');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    // Get total organizations count
    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as int)`.mapWith(Number) })
      .from(organizationTable);
    const totalOrganizations = totalResult[0]?.count || 0;

    // Get organizations with orders this year (active)
    const activeResult = targetEventYearId
      ? await db
          .select({ count: sql<number>`cast(count(DISTINCT ${orderTable.organizationId}) as int)`.mapWith(Number) })
          .from(orderTable)
          .where(eq(orderTable.eventYearId, targetEventYearId))
      : await db
          .select({ count: sql<number>`cast(count(DISTINCT ${orderTable.organizationId}) as int)`.mapWith(Number) })
          .from(orderTable);
    const activeOrganizations = activeResult[0]?.count || 0;

    // Get new organizations (created this calendar year)
    // Using earliest membership date as a proxy for org creation date since organizationTable doesn't have createdAt
    const currentYear = new Date().getFullYear();
    const newResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM (
        SELECT "organizationId", MIN("createdAt") as first_created
        FROM membership
        GROUP BY "organizationId"
        HAVING EXTRACT(YEAR FROM MIN("createdAt")) = ${currentYear}
      ) as new_orgs
    `);
    const newOrganizations = Number(newResult.rows[0]?.count) || 0;

    // Get breakdown by order status for the event year
    let byRegistrationStatus: { status: string; displayName: string; count: number }[] = [];

    if (targetEventYearId) {
      const statusResult = await db
        .select({
          status: orderTable.status,
          count: sql<number>`cast(count(DISTINCT ${orderTable.organizationId}) as int)`.mapWith(Number),
        })
        .from(orderTable)
        .where(eq(orderTable.eventYearId, targetEventYearId))
        .groupBy(orderTable.status);

      byRegistrationStatus = statusResult.map(item => ({
        status: item.status,
        displayName: STATUS_DISPLAY_NAMES[item.status] || item.status,
        count: item.count,
      }));
    }

    return {
      totalOrganizations,
      activeOrganizations,
      newOrganizations,
      byRegistrationStatus,
    };
  } catch (error) {
    console.error('Failed to get organization stats:', error);
    return {
      totalOrganizations: 0,
      activeOrganizations: 0,
      newOrganizations: 0,
      byRegistrationStatus: [],
    };
  }
}

export interface TopOrganization {
  id: string;
  name: string;
  slug: string;
  totalRevenue: number;
  rank: number;
}

export async function getTopOrganizations(eventYearId?: string, limit: number = 5): Promise<TopOrganization[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access top organizations');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    // Only include orders that have actually paid (not just confirmed)
    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];

    // Build the where clause
    const whereClause = targetEventYearId
      ? and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses)
        )
      : inArray(orderTable.status, paidStatuses);

    // Query top organizations by actual collected revenue (totalAmount - balanceOwed)
    const result = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
        totalRevenue: sql<number>`COALESCE(SUM(${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0)), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .where(whereClause)
      .groupBy(organizationTable.id, organizationTable.name, organizationTable.slug)
      .orderBy(sql`SUM(${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0)) DESC`)
      .limit(limit);

    return result.map((org, index) => ({
      ...org,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('Failed to get top organizations:', error);
    return [];
  }
}
