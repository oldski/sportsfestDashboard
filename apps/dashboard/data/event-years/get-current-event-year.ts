import 'server-only';

import { cache } from 'react';
import { db, desc, eq } from '@workspace/database/client';
import { eventYearTable } from '@workspace/database/schema';

export const getCurrentEventYear = cache(async () => {
  try {
    const currentYear = await db
      .select()
      .from(eventYearTable)
      .orderBy(desc(eventYearTable.year))
      .limit(1);

    return currentYear[0] || null;
  } catch (error) {
    console.error('Error fetching current event year:', error);
    return null;
  }
});