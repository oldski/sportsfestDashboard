'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and, inArray } from '@workspace/database/client';
import { orderTable, orderItemTable, productTable, ProductType, OrderStatus } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface RegistrationTimelineData {
  date: string;
  registrations: number;
  cumulative: number;
}

export async function getRegistrationProgress(eventYearId?: string): Promise<RegistrationTimelineData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access registration progress data');
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

    // Query orders that contain team registration products, grouped by date
    // Count distinct organizations per day (one org = one team registration)
    const validStatuses = [
      OrderStatus.CONFIRMED,
      OrderStatus.DEPOSIT_PAID,
      OrderStatus.FULLY_PAID
    ];

    const dailyRegistrations = await db
      .select({
        date: sql<string>`DATE(${orderTable.createdAt})`.as('date'),
        count: sql<number>`COUNT(DISTINCT ${orderTable.organizationId})`.mapWith(Number),
      })
      .from(orderTable)
      .innerJoin(orderItemTable, eq(orderItemTable.orderId, orderTable.id))
      .innerJoin(productTable, eq(productTable.id, orderItemTable.productId))
      .where(
        and(
          eq(orderTable.eventYearId, targetEventYearId),
          eq(productTable.type, ProductType.TEAM_REGISTRATION),
          inArray(orderTable.status, validStatuses)
        )
      )
      .groupBy(sql`DATE(${orderTable.createdAt})`)
      .orderBy(sql`DATE(${orderTable.createdAt}) ASC`);

    if (dailyRegistrations.length === 0) {
      return [];
    }

    // Convert to timeline format with cumulative totals
    let cumulative = 0;
    const timelineData: RegistrationTimelineData[] = dailyRegistrations.map((row) => {
      cumulative += row.count;
      const dateObj = new Date(row.date);
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        registrations: row.count,
        cumulative: cumulative,
      };
    });

    return timelineData;
  } catch (error) {
    console.error('Failed to get registration progress:', error);
    return [];
  }
}
