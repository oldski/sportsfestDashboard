'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql } from '@workspace/database/client';
import { userTable, sessionTable } from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface UserStatsResult {
  totalUsers: number;
  activeThisWeek: number;
  newThisMonth: number;
}

export async function getUserStats(): Promise<UserStatsResult> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access user stats');
  }

  try {
    // Get total users count
    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as int)`.mapWith(Number) })
      .from(userTable);
    const totalUsers = totalResult[0]?.count || 0;

    // Get users with sessions in the last 7 days (active users)
    const activeResult = await db
      .select({ count: sql<number>`cast(count(DISTINCT ${sessionTable.userId}) as int)`.mapWith(Number) })
      .from(sessionTable)
      .where(sql`${sessionTable.createdAt} >= NOW() - INTERVAL '7 days'`);
    const activeThisWeek = activeResult[0]?.count || 0;

    // Get users created this month
    const newResult = await db
      .select({ count: sql<number>`cast(count(*) as int)`.mapWith(Number) })
      .from(userTable)
      .where(sql`${userTable.createdAt} >= DATE_TRUNC('month', NOW())`);
    const newThisMonth = newResult[0]?.count || 0;

    return {
      totalUsers,
      activeThisWeek,
      newThisMonth,
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return {
      totalUsers: 0,
      activeThisWeek: 0,
      newThisMonth: 0,
    };
  }
}
