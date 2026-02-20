'use server';

import { db, eq, sql } from '@workspace/database/client';
import {
  organizationTable,
  membershipTable,
  userTable
} from '@workspace/database/schema';

import { getAuthContext } from '@workspace/auth/context';
import { isSuperAdmin } from '~/lib/admin-utils';

export type CompanyUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  isOwner: boolean;
};

export type CompanyWithUsers = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  memberCount: number;
  users: CompanyUser[];
};

export async function getCompaniesWithUsers(): Promise<CompanyWithUsers[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access this data');
  }

  try {
    // Get all organizations
    const organizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
        phone: organizationTable.phone,
        city: organizationTable.city,
        state: organizationTable.state,
      })
      .from(organizationTable)
      .orderBy(organizationTable.name);

    // Get all memberships with user info
    const memberships = await db
      .select({
        organizationId: membershipTable.organizationId,
        userId: userTable.id,
        userName: userTable.name,
        userEmail: userTable.email,
        userPhone: userTable.phone,
        role: membershipTable.role,
        isOwner: membershipTable.isOwner,
      })
      .from(membershipTable)
      .innerJoin(userTable, eq(membershipTable.userId, userTable.id));

    // Group memberships by org
    const membershipsByOrg = new Map<string, CompanyUser[]>();
    for (const m of memberships) {
      const orgId = m.organizationId;
      if (!membershipsByOrg.has(orgId)) {
        membershipsByOrg.set(orgId, []);
      }
      membershipsByOrg.get(orgId)!.push({
        id: m.userId,
        name: m.userName || '',
        email: m.userEmail,
        phone: m.userPhone,
        role: m.role,
        isOwner: m.isOwner,
      });
    }

    return organizations.map(org => ({
      ...org,
      memberCount: membershipsByOrg.get(org.id)?.length || 0,
      users: membershipsByOrg.get(org.id) || [],
    }));
  } catch (error) {
    console.error('Failed to get companies with users:', error);
    return [];
  }
}
