'use server';

import { auth } from '@workspace/auth';
import { db, eq, and, sql, desc } from '@workspace/database/client';
import { orderTable, organizationTable, eventYearTable, OrderStatus } from '@workspace/database/schema';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

// Helper function to format date in local timezone
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export type OrderWithBalanceData = {
  id: string;
  orderNumber: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  eventYearId: string;
  eventYear: number;
  eventYearName: string;
  totalAmount: number;
  balanceOwed: number;
  depositPaid: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Get orders that have outstanding balances (DEPOSIT_PAID with balanceOwed > 0)
 * This is the true "pending payments" from a business perspective - orders where
 * the customer paid a deposit but still owes a balance.
 */
export async function getOrdersWithOutstandingBalance(): Promise<OrderWithBalanceData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access payment data');
  }

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      return [];
    }

    const result = await db
      .select({
        id: orderTable.id,
        orderNumber: orderTable.orderNumber,
        organizationId: orderTable.organizationId,
        organizationName: organizationTable.name,
        organizationSlug: organizationTable.slug,
        eventYearId: orderTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        totalAmount: orderTable.totalAmount,
        balanceOwed: orderTable.balanceOwed,
        status: orderTable.status,
        createdAt: orderTable.createdAt,
        updatedAt: orderTable.updatedAt,
      })
      .from(orderTable)
      .innerJoin(organizationTable, eq(orderTable.organizationId, organizationTable.id))
      .innerJoin(eventYearTable, eq(orderTable.eventYearId, eventYearTable.id))
      .where(and(
        eq(orderTable.eventYearId, currentEventYear.id as string),
        eq(orderTable.status, OrderStatus.DEPOSIT_PAID),
        sql`COALESCE(${orderTable.balanceOwed}, 0) > 0`
      ))
      .orderBy(desc(orderTable.createdAt));

    return result.map(row => ({
      id: row.id,
      orderNumber: row.orderNumber || `ORD-${row.id.slice(0, 8)}`,
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationSlug: row.organizationSlug,
      eventYearId: row.eventYearId,
      eventYear: row.eventYear,
      eventYearName: row.eventYearName,
      totalAmount: row.totalAmount,
      balanceOwed: row.balanceOwed || 0,
      depositPaid: row.totalAmount - (row.balanceOwed || 0),
      status: row.status,
      createdAt: formatLocalDate(row.createdAt),
      updatedAt: formatLocalDate(row.updatedAt),
    }));
  } catch (error) {
    console.error('Error fetching orders with outstanding balance:', error);
    return [];
  }
}
