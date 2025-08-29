'use server';

import { isSuperAdmin } from '~/lib/admin-utils';
import { getAuthContext } from '@workspace/auth/context';
import { db, sql, desc, eq } from '@workspace/database/client';
import { organizationTable, membershipTable } from '@workspace/database/schema';

export type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  isActive: boolean;
};

export async function getOrganizations(): Promise<OrganizationData[]> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Super admin access required');
  }

  // First, get all organizations
  const organizations = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug
    })
    .from(organizationTable)
    .orderBy(organizationTable.name);

  // Then get member counts separately
  const memberCounts = await db
    .select({
      organizationId: membershipTable.organizationId,
      count: sql<number>`count(*)`.mapWith(Number)
    })
    .from(membershipTable)
    .groupBy(membershipTable.organizationId);

  // Combine the data
  const memberCountMap = new Map(
    memberCounts.map(mc => [mc.organizationId, mc.count])
  );

  return organizations.map(org => ({
    ...org,
    memberCount: memberCountMap.get(org.id) || 0,
    isActive: true
  }));
}