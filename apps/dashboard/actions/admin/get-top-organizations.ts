'use server';

import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { getActiveEventYear } from './get-event-year';
import { db, sql } from '@workspace/database/client';
import { OrderStatus } from '@workspace/database/schema';

export interface TopOrganizationData {
  id: string;
  name: string;
  memberCount: number;
  revenue: number;
  teamCount: number;
  playerCount: number;
}

export type RankingType = 'members' | 'revenue' | 'teams' | 'players';

export async function getTopOrganizations(
  rankingType: RankingType = 'members',
  limit: number = 10
): Promise<TopOrganizationData[]> {
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
      console.log('No active event found');
      return [];
    }

    const paidStatuses = [OrderStatus.DEPOSIT_PAID, OrderStatus.FULLY_PAID];
    const statusList = paidStatuses.map((s) => `'${s}'`).join(', ');

    // Determine order by clause based on ranking type
    let orderByColumn: string;
    switch (rankingType) {
      case 'members':
        orderByColumn = 'member_count';
        break;
      case 'revenue':
        orderByColumn = 'revenue';
        break;
      case 'teams':
        orderByColumn = 'team_count';
        break;
      case 'players':
        orderByColumn = 'player_count';
        break;
      default:
        orderByColumn = 'member_count';
    }

    // Use derived tables (pre-aggregated subqueries) to avoid Cartesian product
    const result = await db.execute(sql`
      SELECT
        o.id,
        o.name,
        COALESCE(mem.member_count, 0)::int as member_count,
        COALESCE(rev.revenue, 0)::numeric as revenue,
        COALESCE(teams.team_count, 0)::int as team_count,
        COALESCE(players.player_count, 0)::int as player_count
      FROM "organization" o
      LEFT JOIN (
        SELECT "organizationId", COUNT(*) as member_count
        FROM "membership"
        GROUP BY "organizationId"
      ) mem ON mem."organizationId" = o.id
      LEFT JOIN (
        SELECT "organizationId", SUM("totalAmount" - COALESCE("balanceOwed", 0)) as revenue
        FROM "order"
        WHERE "eventYearId" = ${activeEvent.id}
          AND "status" IN (${sql.raw(statusList)})
        GROUP BY "organizationId"
      ) rev ON rev."organizationId" = o.id
      LEFT JOIN (
        SELECT "organizationId", COUNT(*) as team_count
        FROM "companyTeam"
        WHERE "eventYearId" = ${activeEvent.id}
        GROUP BY "organizationId"
      ) teams ON teams."organizationId" = o.id
      LEFT JOIN (
        SELECT "organizationId", COUNT(*) as player_count
        FROM "player"
        WHERE "eventYearId" = ${activeEvent.id}
        GROUP BY "organizationId"
      ) players ON players."organizationId" = o.id
      ORDER BY ${sql.raw(orderByColumn)} DESC NULLS LAST
      LIMIT ${limit}
    `);

    console.log('Top organizations query result:', result.rows?.length || 0, 'rows');

    const rows = result.rows as any[];

    return rows.map((org) => ({
      id: org.id,
      name: org.name,
      memberCount: Number(org.member_count) || 0,
      revenue: Number(org.revenue) || 0,
      teamCount: Number(org.team_count) || 0,
      playerCount: Number(org.player_count) || 0
    }));
  } catch (error) {
    console.error('Failed to get top organizations:', error);
    return [];
  }
}
