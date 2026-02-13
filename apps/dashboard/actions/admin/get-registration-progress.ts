'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and } from '@workspace/database/client';
import { companyTeamTable } from '@workspace/database/schema';

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

    // Count paid company teams per day for the current event year
    const dailyRegistrations = await db
      .select({
        date: sql<string>`DATE(${companyTeamTable.createdAt})`.as('date'),
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.eventYearId, targetEventYearId),
          eq(companyTeamTable.isPaid, true)
        )
      )
      .groupBy(sql`DATE(${companyTeamTable.createdAt})`)
      .orderBy(sql`DATE(${companyTeamTable.createdAt}) ASC`);

    if (dailyRegistrations.length === 0) {
      return [];
    }

    // Convert to timeline format with cumulative totals
    let cumulative = 0;
    const timelineData: RegistrationTimelineData[] = dailyRegistrations.map((row) => {
      cumulative += row.count;
      // Parse date as local time by appending T00:00:00 (prevents UTC interpretation)
      const dateObj = new Date(row.date + 'T00:00:00');
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
