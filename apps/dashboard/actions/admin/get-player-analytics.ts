'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql } from '@workspace/database/client';
import { playerTable, playerEventInterestTable, Gender, EventType } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface AgeDistributionData {
  name: string;
  value: number;
}

export interface GenderDistributionData {
  name: string;
  value: number;
}

export interface FavoriteEventsData {
  name: string;
  value: number;
}

const GENDER_DISPLAY_NAMES: Record<string, string> = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
  [Gender.NON_BINARY]: 'Non-Binary',
  [Gender.PREFER_NOT_TO_SAY]: 'Prefer Not to Say',
};

const EVENT_DISPLAY_NAMES: Record<string, string> = {
  [EventType.BEACH_VOLLEYBALL]: 'Beach Volleyball',
  [EventType.TUG_OF_WAR]: 'Tug of War',
  [EventType.CORN_TOSS]: 'Corn Toss',
  [EventType.BOTE_BEACH_CHALLENGE]: 'BOTE Beach Challenge',
  [EventType.BEACH_DODGEBALL]: 'Beach Dodgeball',
};

export async function getAgeDistribution(eventYearId?: string): Promise<AgeDistributionData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access player analytics');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    // Build the where clause
    const whereClause = targetEventYearId
      ? eq(playerTable.eventYearId, targetEventYearId)
      : sql`1=1`;

    // Query age distribution using age brackets
    const result = await db
      .select({
        ageGroup: sql<string>`
          CASE
            WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) BETWEEN 18 AND 25 THEN '18-25'
            WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) BETWEEN 26 AND 35 THEN '26-35'
            WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) BETWEEN 36 AND 45 THEN '36-45'
            WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) > 45 THEN '46+'
            ELSE 'Unknown'
          END
        `,
        count: sql<number>`cast(count(*) as int)`.mapWith(Number),
      })
      .from(playerTable)
      .where(whereClause)
      .groupBy(sql`
        CASE
          WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) BETWEEN 18 AND 25 THEN '18-25'
          WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) BETWEEN 26 AND 35 THEN '26-35'
          WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) BETWEEN 36 AND 45 THEN '36-45'
          WHEN EXTRACT(YEAR FROM AGE(${playerTable.dateOfBirth})) > 45 THEN '46+'
          ELSE 'Unknown'
        END
      `);

    // Sort by age group order
    const sortOrder = ['18-25', '26-35', '36-45', '46+', 'Unknown'];
    return result
      .filter(item => item.count > 0 && item.ageGroup !== 'Unknown')
      .map(item => ({
        name: item.ageGroup,
        value: item.count,
      }))
      .sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));
  } catch (error) {
    console.error('Failed to get age distribution:', error);
    return [];
  }
}

export async function getGenderDistribution(eventYearId?: string): Promise<GenderDistributionData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access player analytics');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    // Build the where clause
    const whereClause = targetEventYearId
      ? eq(playerTable.eventYearId, targetEventYearId)
      : sql`1=1`;

    // Query gender distribution
    const result = await db
      .select({
        gender: playerTable.gender,
        count: sql<number>`cast(count(*) as int)`.mapWith(Number),
      })
      .from(playerTable)
      .where(whereClause)
      .groupBy(playerTable.gender);

    return result
      .filter(item => item.count > 0)
      .map(item => ({
        name: GENDER_DISPLAY_NAMES[item.gender] || item.gender,
        value: item.count,
      }));
  } catch (error) {
    console.error('Failed to get gender distribution:', error);
    return [];
  }
}

export async function getFavoriteEvents(eventYearId?: string): Promise<FavoriteEventsData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access player analytics');
  }

  try {
    // Get the event year to filter by
    let targetEventYearId = eventYearId;
    if (!targetEventYearId) {
      const currentEventYear = await getCurrentEventYear();
      targetEventYearId = currentEventYear?.id as string | undefined;
    }

    // Query favorite events by counting interests (weighted by rating)
    const result = await db
      .select({
        eventType: playerEventInterestTable.eventType,
        totalInterest: sql<number>`cast(SUM(${playerEventInterestTable.interestRating}) as int)`.mapWith(Number),
      })
      .from(playerEventInterestTable)
      .innerJoin(playerTable, eq(playerEventInterestTable.playerId, playerTable.id))
      .where(targetEventYearId ? eq(playerTable.eventYearId, targetEventYearId) : sql`1=1`)
      .groupBy(playerEventInterestTable.eventType)
      .orderBy(sql`SUM(${playerEventInterestTable.interestRating}) DESC`);

    return result
      .filter(item => item.totalInterest > 0)
      .map(item => ({
        name: EVENT_DISPLAY_NAMES[item.eventType] || item.eventType,
        value: item.totalInterest,
      }));
  } catch (error) {
    console.error('Failed to get favorite events:', error);
    return [];
  }
}
