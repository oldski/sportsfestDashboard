'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql, and, gte, lte, isNotNull } from '@workspace/database/client';
import { userTable, eventYearTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface ReferralSourceData {
  name: string;
  value: number;
  percentage: number;
}

// Display names for referral sources (maps stored values to friendly names)
const REFERRAL_SOURCE_DISPLAY_NAMES: Record<string, string> = {
  "I'm a Previous Participating Company": 'Previous Company',
  'Contacted by a SportsFest Representative': 'SportsFest Rep',
  'Referral from another company': 'Company Referral',
  'Tampa Bay Business Journal': 'Tampa Bay Business Journal',
  'MOR TV': 'MOR TV',
  'Radio': 'Radio',
  'Google Search': 'Google Search',
  'Other': 'Other',
};

export async function getReferralSourceAnalytics(eventYearId?: string): Promise<{
  data: ReferralSourceData[];
  totalResponses: number;
  eventYearName: string | null;
}> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access referral source analytics');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    let eventYearName: string | null = null;

    if (!targetEventYearId || targetEventYearId === 'all') {
      if (targetEventYearId !== 'all') {
        const currentEventYear = await getCurrentEventYear();
        targetEventYearId = currentEventYear?.id as string | undefined;
        eventYearName = currentEventYear ? `${currentEventYear.year}` : null;
      }
    } else {
      // Get the event year name for display
      const eventYear = await db
        .select({ year: eventYearTable.year, name: eventYearTable.name })
        .from(eventYearTable)
        .where(sql`${eventYearTable.id} = ${targetEventYearId}`)
        .limit(1);

      if (eventYear.length > 0) {
        eventYearName = `${eventYear[0].year}`;
      }
    }

    // Build the query based on whether we're filtering by event year
    let whereConditions;

    if (targetEventYearId && targetEventYearId !== 'all') {
      // Get the event year date range
      const eventYearData = await db
        .select({
          registrationOpen: eventYearTable.registrationOpen,
          eventEndDate: eventYearTable.eventEndDate
        })
        .from(eventYearTable)
        .where(sql`${eventYearTable.id} = ${targetEventYearId}`)
        .limit(1);

      if (eventYearData.length > 0) {
        const { registrationOpen, eventEndDate } = eventYearData[0];
        whereConditions = and(
          isNotNull(userTable.referralSource),
          gte(userTable.createdAt, registrationOpen),
          lte(userTable.createdAt, eventEndDate)
        );
      } else {
        whereConditions = isNotNull(userTable.referralSource);
      }
    } else {
      // All time - just filter for non-null referral sources
      whereConditions = isNotNull(userTable.referralSource);
      eventYearName = 'All Time';
    }

    // Query referral source distribution
    const result = await db
      .select({
        referralSource: userTable.referralSource,
        count: sql<number>`cast(count(*) as int)`.mapWith(Number),
      })
      .from(userTable)
      .where(whereConditions)
      .groupBy(userTable.referralSource)
      .orderBy(sql`count(*) DESC`);

    // Calculate total for percentages
    const totalResponses = result.reduce((sum, item) => sum + item.count, 0);

    // Transform the data
    const data: ReferralSourceData[] = result
      .filter(item => item.referralSource && item.count > 0)
      .map(item => ({
        name: REFERRAL_SOURCE_DISPLAY_NAMES[item.referralSource!] || item.referralSource!,
        value: item.count,
        percentage: totalResponses > 0 ? (item.count / totalResponses) * 100 : 0,
      }));

    return {
      data,
      totalResponses,
      eventYearName,
    };
  } catch (error) {
    console.error('Failed to get referral source analytics:', error);
    return {
      data: [],
      totalResponses: 0,
      eventYearName: null,
    };
  }
}