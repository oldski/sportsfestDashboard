'use server';

import { db, eq, desc } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

export type EventYearSimple = {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
};

export async function getEventYearsSimple(): Promise<EventYearSimple[]> {
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
        isActive: eventYearTable.isActive,
      })
      .from(eventYearTable)
      .where(eq(eventYearTable.isDeleted, false))
      .orderBy(desc(eventYearTable.year));

    return eventYears;
  } catch (error) {
    console.error('Error fetching event years:', error);
    return [];
  }
}
