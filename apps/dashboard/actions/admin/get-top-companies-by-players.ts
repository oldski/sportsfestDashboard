'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, eq, sql, and } from '@workspace/database/client';
import { playerTable, organizationTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';

export interface CompanyPlayerCountData {
  name: string;
  playerCount: number;
}

export async function getTopCompaniesByPlayers(eventYearId?: string): Promise<CompanyPlayerCountData[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access player count data');
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

    // Get player counts by organization for the event year
    const playerCounts = await db
      .select({
        organizationName: organizationTable.name,
        playerCount: sql<number>`COUNT(${playerTable.id})`.mapWith(Number),
      })
      .from(playerTable)
      .innerJoin(organizationTable, eq(playerTable.organizationId, organizationTable.id))
      .where(eq(playerTable.eventYearId, targetEventYearId))
      .groupBy(organizationTable.id, organizationTable.name)
      .orderBy(sql`COUNT(${playerTable.id}) DESC`)
      .limit(10);

    return playerCounts.map(row => ({
      name: row.organizationName,
      playerCount: row.playerCount,
    }));
  } catch (error) {
    console.error('Failed to get top companies by players:', error);
    return [];
  }
}
