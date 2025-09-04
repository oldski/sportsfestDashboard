'use server';

import { db, sql } from '@workspace/database/client';

export async function getOrganizationBySlug(slug: string) {
  console.log('getOrganizationBySlug: About to execute raw SQL...');
  
  const result = await db.execute(sql`
    SELECT 
      id, name, slug, address, city, state, zip, email, website, phone, logo
    FROM "organization" 
    WHERE slug = ${slug}
    LIMIT 1
  `);

  console.log('getOrganizationBySlug: SQL executed, rows found:', result.rows.length);
  
  return result.rows[0] || null;
}