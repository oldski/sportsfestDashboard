'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import { organizationTable, orderTable, orderItemTable, productTable, ProductType, OrderStatus } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface OrganizationRevenueData {
  name: string;
  teamRegistration: number;
  tentRentals: number;
  sponsorships: number;
  other: number;
  total: number;
}

export async function getOrganizationPerformance(eventYearId?: string): Promise<OrganizationRevenueData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access organization performance data');
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

    // Get revenue by product type per organization (excluding sponsorships)
    const revenueByOrgAndType = await db
      .select({
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        productType: productTable.type,
        revenue: sql<number>`
          COALESCE(SUM(
            CASE
              WHEN ${orderTable.totalAmount} > 0
              THEN (${orderItemTable.totalPrice} / ${orderTable.totalAmount}) * (${orderTable.totalAmount} - COALESCE(${orderTable.balanceOwed}, 0))
              ELSE 0
            END
          ), 0)
        `.mapWith(Number),
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses),
          eq(orderTable.isSponsorship, false)
        )
      )
      .groupBy(orderTable.organizationId, organizationTable.name, productTable.type);

    // Get sponsorship revenue per organization (use baseAmount from metadata to exclude processing fee)
    const sponsorshipByOrg = await db
      .select({
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        revenue: sql<number>`COALESCE(SUM(
          COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric, ${orderTable.totalAmount})
          - COALESCE(${orderTable.balanceOwed}, 0) * COALESCE((${orderTable.metadata}->'sponsorship'->>'baseAmount')::numeric / NULLIF(${orderTable.totalAmount}, 0), 1)
        ), 0)`.mapWith(Number),
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, paidStatuses),
          eq(orderTable.isSponsorship, true)
        )
      )
      .groupBy(orderTable.organizationId, organizationTable.name);

    // Build a map of organization data
    const orgMap = new Map<string, OrganizationRevenueData>();

    // Process product type revenue
    for (const row of revenueByOrgAndType) {
      if (!row.organizationId) continue;

      if (!orgMap.has(row.organizationId)) {
        orgMap.set(row.organizationId, {
          name: row.organizationName,
          teamRegistration: 0,
          tentRentals: 0,
          sponsorships: 0,
          other: 0,
          total: 0,
        });
      }

      const org = orgMap.get(row.organizationId)!;
      const amount = Math.round(row.revenue * 100) / 100;

      switch (row.productType) {
        case ProductType.TEAM_REGISTRATION:
          org.teamRegistration = amount;
          break;
        case ProductType.TENT_RENTAL:
          org.tentRentals = amount;
          break;
        default:
          org.other += amount;
          break;
      }
    }

    // Add sponsorship revenue
    for (const row of sponsorshipByOrg) {
      if (!row.organizationId) continue;

      if (!orgMap.has(row.organizationId)) {
        orgMap.set(row.organizationId, {
          name: row.organizationName,
          teamRegistration: 0,
          tentRentals: 0,
          sponsorships: 0,
          other: 0,
          total: 0,
        });
      }

      const org = orgMap.get(row.organizationId)!;
      org.sponsorships = Math.round(row.revenue * 100) / 100;
    }

    // Calculate totals and convert to array
    const result: OrganizationRevenueData[] = [];
    for (const org of orgMap.values()) {
      org.other = Math.round(org.other * 100) / 100;
      org.total = Math.round((org.teamRegistration + org.tentRentals + org.sponsorships + org.other) * 100) / 100;
      if (org.total > 0) {
        result.push(org);
      }
    }

    // Sort by total revenue descending and take top 10
    return result
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to get organization performance data:', error);
    return [];
  }
}
