'use server';

import { db, eq, desc } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';

import { isSuperAdmin } from '~/lib/admin-utils';

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

    // Transform to match component expectations
    const eventYearsWithStats: EventYearWithStats[] = eventYears.map((ey) => {
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

      return {
        id: ey.id,
        year: ey.year,
        name: ey.name,
        description: `Annual corporate sports festival`,
        startDate: ey.eventStartDate.toISOString().split('T')[0],
        endDate: ey.eventEndDate.toISOString().split('T')[0],
        registrationOpen: (regOpen < now && regClose > now),
        registrationDeadline: ey.registrationClose.toISOString().split('T')[0],
        productCount: 0, // TODO: Add product count query
        organizationCount: 0, // TODO: Add organization count query
        totalRevenue: 0, // TODO: Add revenue calculation
        status,
        createdAt: ey.createdAt.toISOString().split('T')[0],
      };
    });

    return eventYearsWithStats;
  } catch (error) {
    console.error('Error fetching event years:', error);
    throw new Error('Failed to fetch event years');
  }
}
