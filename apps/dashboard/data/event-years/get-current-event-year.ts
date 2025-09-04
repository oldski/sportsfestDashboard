import 'server-only';

import { cache } from 'react';
import { db, sql } from '@workspace/database/client';

export const getCurrentEventYear = cache(async () => {
  try {
    console.log('Getting current (active) event year...');
    const result = await db.execute(sql`
      SELECT id, name, year, "isActive" 
      FROM "eventYear" 
      WHERE "isActive" = true 
      LIMIT 1
    `);

    console.log('Active event years found:', result.rows.length);
    if (result.rows[0]) {
      console.log('Active event year:', result.rows[0].name, 'ID:', result.rows[0].id);
    }

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching current event year:', error);
    return null;
  }
});