'use server';

import { db, eq, asc, count } from '@workspace/database/client';
import { productCategoryTable, productTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

export type ProductCategoryWithStats = {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export async function getProductCategories(): Promise<ProductCategoryWithStats[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access product categories');
  }

  try {
    const categories = await db
      .select({
        id: productCategoryTable.id,
        name: productCategoryTable.name,
        description: productCategoryTable.description,
        displayOrder: productCategoryTable.displayOrder,
        isActive: productCategoryTable.isActive,
        createdAt: productCategoryTable.createdAt,
        updatedAt: productCategoryTable.updatedAt,
        productCount: count(productTable.id),
      })
      .from(productCategoryTable)
      .leftJoin(
        productTable, 
        eq(productCategoryTable.id, productTable.categoryId)
      )
      .groupBy(
        productCategoryTable.id,
        productCategoryTable.name,
        productCategoryTable.description,
        productCategoryTable.displayOrder,
        productCategoryTable.isActive,
        productCategoryTable.createdAt,
        productCategoryTable.updatedAt
      )
      .orderBy(asc(productCategoryTable.displayOrder), asc(productCategoryTable.name));

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive,
      productCount: category.productCount,
      createdAt: category.createdAt.toISOString().split('T')[0],
      updatedAt: category.updatedAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw new Error('Failed to fetch product categories');
  }
}

export async function getProductCategory(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access product categories');
  }

  try {
    const [category] = await db
      .select()
      .from(productCategoryTable)
      .where(eq(productCategoryTable.id, id));

    return category || null;
  } catch (error) {
    console.error('Error fetching product category:', error);
    throw new Error('Failed to fetch product category');
  }
}