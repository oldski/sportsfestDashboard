'use server';

import { db, eq, asc } from '@workspace/database/client';
import { eventYearTable, productCategoryTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

export type ProductFormSelectData = {
  eventYears: Array<{ id: string; year: number; name: string }>;
  categories: Array<{ id: string; name: string }>;
};

export async function getProductFormData(): Promise<ProductFormSelectData> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access form data');
  }

  try {
    const [eventYears, categories] = await Promise.all([
      db
        .select({
          id: eventYearTable.id,
          year: eventYearTable.year,
          name: eventYearTable.name,
        })
        .from(eventYearTable)
        .where(eq(eventYearTable.isDeleted, false))
        .orderBy(asc(eventYearTable.year)),
      
      db
        .select({
          id: productCategoryTable.id,
          name: productCategoryTable.name,
        })
        .from(productCategoryTable)
        .where(eq(productCategoryTable.isActive, true))
        .orderBy(asc(productCategoryTable.displayOrder), asc(productCategoryTable.name))
    ]);

    return {
      eventYears,
      categories,
    };
  } catch (error) {
    console.error('Error fetching product form data:', error);
    throw new Error('Failed to fetch form data');
  }
}