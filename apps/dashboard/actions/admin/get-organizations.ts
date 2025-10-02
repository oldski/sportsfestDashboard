'use server';

import { isSuperAdmin } from '~/lib/admin-utils';
import { getAuthContext } from '@workspace/auth/context';
import { db, sql } from '@workspace/database/client';
import { organizationTable, membershipTable } from '@workspace/database/schema';

export type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  phone: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  createdAt: Date | null;
  isActive: boolean;
};

export async function getOrganizations(): Promise<OrganizationData[]> {
  const { session } = await getAuthContext();
  
  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Super admin access required');
  }

  // Get organizations with member counts and earliest membership date
  const organizations = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug,
      phone: organizationTable.phone,
      address: organizationTable.address,
      address2: organizationTable.address2,
      city: organizationTable.city,
      state: organizationTable.state,
      zip: organizationTable.zip,
      memberCount: sql<number>`COUNT(${membershipTable.id})`.mapWith(Number),
      createdAt: sql<Date>`MIN(${membershipTable.createdAt})`
    })
    .from(organizationTable)
    .leftJoin(membershipTable, sql`${membershipTable.organizationId} = ${organizationTable.id}`)
    .groupBy(
      organizationTable.id,
      organizationTable.name,
      organizationTable.slug,
      organizationTable.phone,
      organizationTable.address,
      organizationTable.address2,
      organizationTable.city,
      organizationTable.state,
      organizationTable.zip
    )
    .orderBy(organizationTable.name);

  return organizations.map(org => ({
    ...org,
    isActive: true
  }));
}

export type OrganizationOption = {
  id: string;
  name: string;
};

export async function getOrganizationsForSelect(): Promise<OrganizationOption[]> {
  const { session } = await getAuthContext();

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Super admin access required');
  }

  try {
    const organizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
      })
      .from(organizationTable)
      .orderBy(organizationTable.name);

    return organizations;
  } catch (error) {
    console.error('Error fetching organizations for select:', error);
    throw new Error('Failed to fetch organizations');
  }
}