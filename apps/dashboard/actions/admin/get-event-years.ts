'use server';

import { db, eq, desc, and, sql } from '@workspace/database/client';
import { eventYearTable, product, order, orderItem, companyTeamTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';

import { isSuperAdmin } from '~/lib/admin-utils';

// Helper function to get product count for an event year
async function getProductCount(eventYearId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: sql`cast(count(*) as int)`.mapWith(Number) })
      .from(product)
      .where(
        and(
          eq(product.eventYearId, eventYearId),
          // eq(product.isDeleted, false)
        )
      );
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching product count:', error);
    return 0;
  }
}

// Helper function to get company teams count for an event year
async function getCompanyTeamsCount(eventYearId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: sql`cast(count(*) as int)`.mapWith(Number) })
      .from(companyTeamTable)
      .where(eq(companyTeamTable.eventYearId, eventYearId));
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching company teams count:', error);
    return 0;
  }
}

// Helper function to get total revenue for an event year
async function getTotalRevenue(eventYearId: string): Promise<number> {
  try {
    const result = await db
      .select({
        revenue: sql`cast(COALESCE(SUM(
          CASE
            WHEN ${order.status} = 'fully_paid' THEN ${orderItem.totalPrice}
            WHEN ${order.status} = 'deposit_paid' THEN ${orderItem.totalPrice} * 0.3
            ELSE 0
          END
        ), 0) as numeric)`.mapWith(Number)
      })
      .from(orderItem)
      .innerJoin(order, eq(orderItem.orderId, order.id))
      .where(
        and(
          eq(order.eventYearId, eventYearId),
          sql`${order.status} IN ('fully_paid', 'deposit_paid')`
        )
      );
    return result[0]?.revenue || 0;
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    return 0;
  }
}

export type EventYearWithStats = {
  id: string;
  year: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
  registrationDeadline: string;
  productCount: number;
  companyTeamsCount: number;
  organizationCount: number;
  totalRevenue: number;
  status: 'active' | 'completed' | 'draft';
  createdAt: string;
};

export async function getEventYears(): Promise<EventYearWithStats[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access event years');
  }

  try {
    const eventYears = await db
      .select({
        id: eventYearTable.id,
        year: eventYearTable.year,
        name: eventYearTable.name,
        eventStartDate: eventYearTable.eventStartDate,
        eventEndDate: eventYearTable.eventEndDate,
        registrationOpen: eventYearTable.registrationOpen,
        registrationClose: eventYearTable.registrationClose,
        isActive: eventYearTable.isActive,
        createdAt: eventYearTable.createdAt,
      })
      .from(eventYearTable)
      .where(eq(eventYearTable.isDeleted, false))
      .orderBy(desc(eventYearTable.year));

    // Transform to match component expectations with real stats
    const eventYearsWithStats: EventYearWithStats[] = await Promise.all(
      eventYears.map(async (ey) => {
        const now = new Date();
        const eventEnd = new Date(ey.eventEndDate);
        const regOpen = new Date(ey.registrationOpen);
        const regClose = new Date(ey.registrationClose);

        let status: 'active' | 'completed' | 'draft' = 'draft';
        if (ey.isActive) {
          status = 'active';
        } else if (eventEnd < now) {
          status = 'completed';
        }

        // Get real stats for this event year
        const [productCount, companyTeamsCount, totalRevenue] = await Promise.all([
          getProductCount(ey.id),
          getCompanyTeamsCount(ey.id),
          getTotalRevenue(ey.id)
        ]);

        return {
          id: ey.id,
          year: ey.year,
          name: ey.name,
          description: `Annual corporate sports festival`,
          startDate: ey.eventStartDate.toISOString().split('T')[0],
          endDate: ey.eventEndDate.toISOString().split('T')[0],
          registrationOpen: (regOpen < now && regClose > now),
          registrationDeadline: ey.registrationClose.toISOString().split('T')[0],
          productCount,
          companyTeamsCount,
          organizationCount: companyTeamsCount,
          totalRevenue,
          status,
          createdAt: ey.createdAt.toISOString().split('T')[0],
        };
      })
    );

    return eventYearsWithStats;
  } catch (error) {
    console.error('Error fetching event years:', error);
    throw new Error('Failed to fetch event years');
  }
}
