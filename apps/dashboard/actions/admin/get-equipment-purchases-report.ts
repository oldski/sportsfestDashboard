'use server';

import { db, eq, sql, and, inArray } from '@workspace/database/client';
import {
  membershipTable,
  organizationTable,
  orderTable,
  orderItemTable,
  userTable,
  OrderStatus,
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

const WATER_PRODUCT_ID = 'c9679b6d-9b8b-43bf-8db6-b6ab8eed3094';
const ICE_PRODUCT_ID = '60873753-6042-4dac-a59a-920163a96b5e';

export type EquipmentPurchaseRow = {
  organizationId: string;
  companyName: string;
  organizerName: string | null;
  organizerEmail: string | null;
  organizerPhone: string | null;
  waterQuantity: number;
  iceQuantity: number;
};

export type EquipmentPurchasesReportData = {
  totalOrganizations: number;
  totalWater: number;
  totalIce: number;
  rows: EquipmentPurchaseRow[];
};

export async function getEquipmentPurchasesReport(
  eventYearId?: string
): Promise<EquipmentPurchasesReportData> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access this data');
  }

  try {
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    if (!targetEventYearId) {
      return { totalOrganizations: 0, totalWater: 0, totalIce: 0, rows: [] };
    }

    const waterSumExpr = sql<number>`COALESCE(SUM(CASE WHEN ${orderItemTable.productId} = ${WATER_PRODUCT_ID} THEN ${orderItemTable.quantity} ELSE 0 END), 0)`;
    const iceSumExpr = sql<number>`COALESCE(SUM(CASE WHEN ${orderItemTable.productId} = ${ICE_PRODUCT_ID} THEN ${orderItemTable.quantity} ELSE 0 END), 0)`;

    const rawRows = await db
      .select({
        organizationId: organizationTable.id,
        companyName: organizationTable.name,
        organizerName: userTable.name,
        organizerEmail: userTable.email,
        organizerPhone: userTable.phone,
        waterQuantity: waterSumExpr.mapWith(Number),
        iceQuantity: iceSumExpr.mapWith(Number),
      })
      .from(orderItemTable)
      .innerJoin(orderTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(
        organizationTable,
        eq(orderTable.organizationId, organizationTable.id)
      )
      .leftJoin(
        membershipTable,
        and(
          eq(membershipTable.organizationId, organizationTable.id),
          eq(membershipTable.isOwner, true)
        )
      )
      .leftJoin(userTable, eq(membershipTable.userId, userTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          inArray(orderTable.status, [
            OrderStatus.DEPOSIT_PAID,
            OrderStatus.FULLY_PAID,
          ]),
          eq(orderTable.isSponsorship, false),
          inArray(orderItemTable.productId, [
            WATER_PRODUCT_ID,
            ICE_PRODUCT_ID,
          ])
        )
      )
      .groupBy(organizationTable.id, organizationTable.name, userTable.id)
      .having(sql`${waterSumExpr} + ${iceSumExpr} > 0`)
      .orderBy(organizationTable.name);

    // Organizations with multiple owners will appear as multiple rows from the
    // leftJoin. Merge them into one row per organization and sum the quantities
    // once — the join duplicates order items once per owner, so we take the
    // per-owner quantities from the first seen row rather than summing them.
    const byOrg = new Map<string, EquipmentPurchaseRow>();
    for (const row of rawRows) {
      const existing = byOrg.get(row.organizationId);
      if (!existing) {
        byOrg.set(row.organizationId, {
          organizationId: row.organizationId,
          companyName: row.companyName,
          organizerName: row.organizerName,
          organizerEmail: row.organizerEmail,
          organizerPhone: row.organizerPhone,
          waterQuantity: row.waterQuantity,
          iceQuantity: row.iceQuantity,
        });
      } else {
        existing.organizerName = existing.organizerName ?? row.organizerName;
        existing.organizerEmail = existing.organizerEmail ?? row.organizerEmail;
        existing.organizerPhone = existing.organizerPhone ?? row.organizerPhone;
      }
    }

    const rows = Array.from(byOrg.values()).sort((a, b) =>
      a.companyName.localeCompare(b.companyName)
    );

    const totalWater = rows.reduce((sum, r) => sum + r.waterQuantity, 0);
    const totalIce = rows.reduce((sum, r) => sum + r.iceQuantity, 0);

    return {
      totalOrganizations: rows.length,
      totalWater,
      totalIce,
      rows,
    };
  } catch (error) {
    console.error('Failed to get equipment purchases report:', error);
    return { totalOrganizations: 0, totalWater: 0, totalIce: 0, rows: [] };
  }
}
