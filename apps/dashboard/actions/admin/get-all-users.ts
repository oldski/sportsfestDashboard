'use server';

import { ForbiddenError } from '@workspace/common/errors';
import { db, sql } from '@workspace/database/client';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export interface UserOverview {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  isSportsFestAdmin: boolean;
  organizationCount: number;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export async function getAllUsers(): Promise<UserOverview[]> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new ForbiddenError('Unauthorized: Only super admins can access user data');
  }

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.email,
      u.name,
      u.email_verified,
      u.is_sports_fest_admin,
      u.created_at,
      s.expires as last_login_at,
      COALESCE(org_count.organization_count, 0) as organization_count
    FROM "user" u
    LEFT JOIN (
      SELECT 
        user_id, 
        COUNT(DISTINCT organization_id) as organization_count 
      FROM membership 
      GROUP BY user_id
    ) org_count ON u.id = org_count.user_id
    LEFT JOIN (
      SELECT 
        user_id,
        MAX(expires) as expires
      FROM session 
      GROUP BY user_id
    ) s ON u.id = s.user_id
    ORDER BY u.created_at DESC
  `);

  return (result as unknown as any[]).map((row: any) => ({
    id: row.id as string,
    email: row.email as string,
    name: row.name as string | null,
    emailVerified: Boolean(row.email_verified),
    isSportsFestAdmin: Boolean(row.is_sports_fest_admin),
    organizationCount: Number(row.organization_count),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at as string) : null,
    createdAt: new Date(row.created_at as string)
  }));
}