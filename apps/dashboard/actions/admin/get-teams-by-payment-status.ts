'use server';

import { db, eq, sql, and, inArray, or, like } from '@workspace/database/client';
import {
  organizationTable,
  orderTable,
  orderItemTable,
  productTable,
  OrderStatus,
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export type TeamPaymentRow = {
  id: string;
  companyName: string;
  orderNumber: string;
  teamCount: number;
  totalAmount: number;
  depositPaid: number;
  balanceOwed: number;
  date: Date | null;
};

export type TeamsByPaymentStatusData = {
  totalOrders: number;
  totalTeams: number;
  totalAmount: number;
  rows: TeamPaymentRow[];
};

export async function getTeamsByPaymentStatus(
  status: 'FULLY_PAID' | 'DEPOSIT_PAID',
  eventYearId?: string
): Promise<TeamsByPaymentStatusData> {
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
      return { totalOrders: 0, totalTeams: 0, totalAmount: 0, rows: [] };
    }

    const orderStatus = status === 'FULLY_PAID' ? OrderStatus.FULLY_PAID : OrderStatus.DEPOSIT_PAID;

    // Get orders with matching status, along with team count from order items
    // Only include orders that contain at least one team product
    const teamCountExpr = sql<number>`COALESCE(SUM(CASE WHEN (
      LOWER(${productTable.name}) LIKE '%team%' OR
      LOWER(${productTable.name}) LIKE '%company team%'
    ) THEN ${orderItemTable.quantity} ELSE 0 END), 0)`;

    const orders = await db
      .select({
        id: orderTable.id,
        companyName: organizationTable.name,
        orderNumber: orderTable.orderNumber,
        totalAmount: orderTable.totalAmount,
        depositPaid: orderTable.depositAmount,
        balanceOwed: orderTable.balanceOwed,
        date: orderTable.createdAt,
        teamCount: teamCountExpr.mapWith(Number),
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .leftJoin(orderItemTable, eq(orderItemTable.orderId, orderTable.id))
      .leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          eq(orderTable.status, orderStatus),
          eq(orderTable.isSponsorship, false)
        )
      )
      .groupBy(
        orderTable.id,
        organizationTable.name,
        orderTable.orderNumber,
        orderTable.totalAmount,
        orderTable.depositAmount,
        orderTable.balanceOwed,
        orderTable.createdAt
      )
      .having(sql`${teamCountExpr} > 0`)
      .orderBy(organizationTable.name);

    const totalOrders = orders.length;
    const totalTeams = orders.reduce((sum, o) => sum + o.teamCount, 0);
    const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalOrders,
      totalTeams,
      totalAmount: Math.round(totalAmount * 100) / 100,
      rows: orders.map(o => ({
        id: o.id,
        companyName: o.companyName,
        orderNumber: o.orderNumber,
        teamCount: o.teamCount,
        totalAmount: o.totalAmount || 0,
        depositPaid: o.depositPaid || 0,
        balanceOwed: o.balanceOwed || 0,
        date: o.date,
      })),
    };
  } catch (error) {
    console.error(`Failed to get teams by payment status (${status}):`, error);
    return { totalOrders: 0, totalTeams: 0, totalAmount: 0, rows: [] };
  }
}
