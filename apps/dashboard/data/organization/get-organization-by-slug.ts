import 'server-only';

import { db, eq } from '@workspace/database/client';
import { organizationTable } from '@workspace/database/schema';

export interface OrganizationBasic {
  id: string;
  name: string;
  slug: string;
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationBasic | null> {
  const [organization] = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug,
    })
    .from(organizationTable)
    .where(eq(organizationTable.slug, slug))
    .limit(1);

  return organization || null;
}