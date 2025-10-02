'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { db, sql, desc, eq, and } from '@workspace/database/client';
import { organizationTable, membershipTable, orderTable, playerTable, companyTeamTable, OrderStatus } from '@workspace/database/schema';

export interface TopOrganizationData {
  id: string;
  name: string;
  memberCount: number;
  revenue: number;
  teamCount: number;
  playerCount: number;
}

export type RankingType = 'members' | 'revenue' | 'teams' | 'players';

export async function getTopOrganizations(rankingType: RankingType = 'members', limit: number = 10): Promise<TopOrganizationData[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access top organizations data');
  }

  try {
    const activeEvent = await getActiveEventYear();

    if (!activeEvent?.id) {
      return [];
    }

    // Get comprehensive organization data
    const topOrgs = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        memberCount: sql<number>`COUNT(DISTINCT ${membershipTable.id})`,
        revenue: sql<number>`COALESCE(SUM(CASE WHEN ${orderTable.eventYearId} = ${activeEvent.id} AND ${orderTable.status} IN ('fully_paid', 'deposit_paid') THEN ${orderTable.totalAmount} ELSE 0 END), 0)`,
        teamCount: sql<number>`COALESCE(SUM(CASE WHEN ${companyTeamTable.eventYearId} = ${activeEvent.id} THEN 1 ELSE 0 END), 0)`,
        playerCount: sql<number>`COALESCE(SUM(CASE WHEN ${playerTable.eventYearId} = ${activeEvent.id} THEN 1 ELSE 0 END), 0)`
      })
      .from(organizationTable)
      .leftJoin(membershipTable, eq(membershipTable.organizationId, organizationTable.id))
      .leftJoin(orderTable, eq(orderTable.organizationId, organizationTable.id))
      .leftJoin(companyTeamTable, eq(companyTeamTable.organizationId, organizationTable.id))
      .leftJoin(playerTable, eq(playerTable.organizationId, organizationTable.id))
      .groupBy(organizationTable.id, organizationTable.name)
      .orderBy(getOrderByClause(rankingType))
      .limit(limit);


    return topOrgs.map(org => ({
      id: org.id,
      name: org.name,
      memberCount: Number(org.memberCount),
      revenue: Number(org.revenue),
      teamCount: Number(org.teamCount),
      playerCount: Number(org.playerCount)
    }));

  } catch (error) {
    console.error('Failed to get top organizations:', error);
    return [];
  }
}

function getOrderByClause(rankingType: RankingType) {
  switch (rankingType) {
    case 'members':
      return desc(sql`COUNT(DISTINCT membership.id)`);
    case 'revenue':
      return desc(sql`COALESCE(SUM(CASE WHEN "order"."eventYearId" = (SELECT id FROM "eventYear" WHERE "isActive" = true AND "isDeleted" = false LIMIT 1) AND "order"."status" IN ('fully_paid', 'deposit_paid') THEN "order"."totalAmount" ELSE 0 END), 0)`);
    case 'teams':
      return desc(sql`COALESCE(SUM(CASE WHEN "companyTeam"."eventYearId" = (SELECT id FROM "eventYear" WHERE "isActive" = true AND "isDeleted" = false LIMIT 1) THEN 1 ELSE 0 END), 0)`);
    case 'players':
      return desc(sql`COALESCE(SUM(CASE WHEN "player"."eventYearId" = (SELECT id FROM "eventYear" WHERE "isActive" = true AND "isDeleted" = false LIMIT 1) THEN 1 ELSE 0 END), 0)`);
    default:
      return desc(sql`COUNT(DISTINCT membership.id)`);
  }
}