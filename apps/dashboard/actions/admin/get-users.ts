'use server';

import { isSuperAdmin } from '~/lib/admin-utils';
import { getAuthContext } from '@workspace/auth/context';
import { db, sql, desc, eq } from '@workspace/database/client';
import { userTable, organizationTable, membershipTable } from '@workspace/database/schema';

export type UserData = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  lastLogin: Date | null;
  isSportsFestAdmin: boolean;
  organizationName: string | null;
  organizationSlug: string | null;
  isActive: boolean;
};

export async function getUsers(): Promise<UserData[]> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Super admin access required');
  }

  // First, get all users
  const users = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      createdAt: userTable.createdAt,
      lastLogin: userTable.lastLogin,
      isSportsFestAdmin: userTable.isSportsFestAdmin
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt));

  // Get user memberships with organization info
  const memberships = await db
    .select({
      userId: membershipTable.userId,
      organizationName: organizationTable.name,
      organizationSlug: organizationTable.slug
    })
    .from(membershipTable)
    .innerJoin(
      organizationTable,
      eq(membershipTable.organizationId, organizationTable.id)
    );

  // Create a map of user to organization
  const organizationMap = new Map(
    memberships.map(m => [m.userId, {
      name: m.organizationName,
      slug: m.organizationSlug
    }])
  );

  return users.map(user => ({
    ...user,
    organizationName: organizationMap.get(user.id)?.name || null,
    organizationSlug: organizationMap.get(user.id)?.slug || null,
    isActive: true
  }));
}