'use server';

import { db, eq, desc, asc } from '@workspace/database/client';
import { productTable, productCategoryTable, eventYearTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

export type ProductWithDetails = {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  basePrice: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  maxQuantityPerOrg?: number;
  totalInventory?: number;
  categoryId: string;
  categoryName: string;
  eventYearId: string;
  eventYear: number;
  eventYearName: string;
  createdAt: string;
  updatedAt: string;
};

export async function getProducts(): Promise<ProductWithDetails[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access products');
  }

  try {
    const products = await db
      .select({
        id: productTable.id,
        name: productTable.name,
        description: productTable.description,
        type: productTable.type,
        status: productTable.status,
        basePrice: productTable.basePrice,
        requiresDeposit: productTable.requiresDeposit,
        depositAmount: productTable.depositAmount,
        maxQuantityPerOrg: productTable.maxQuantityPerOrg,
        totalInventory: productTable.totalInventory,
        categoryId: productTable.categoryId,
        categoryName: productCategoryTable.name,
        eventYearId: productTable.eventYearId,
        eventYear: eventYearTable.year,
        eventYearName: eventYearTable.name,
        createdAt: productTable.createdAt,
        updatedAt: productTable.updatedAt,
      })
      .from(productTable)
      .leftJoin(productCategoryTable, eq(productTable.categoryId, productCategoryTable.id))
      .leftJoin(eventYearTable, eq(productTable.eventYearId, eventYearTable.id))
      .orderBy(desc(productTable.createdAt), asc(productTable.name));

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      type: product.type,
      status: product.status,
      basePrice: product.basePrice,
      requiresDeposit: product.requiresDeposit,
      depositAmount: product.depositAmount || undefined,
      maxQuantityPerOrg: product.maxQuantityPerOrg || undefined,
      totalInventory: product.totalInventory || undefined,
      categoryId: product.categoryId,
      categoryName: product.categoryName || 'Unknown Category',
      eventYearId: product.eventYearId,
      eventYear: product.eventYear || 0,
      eventYearName: product.eventYearName || 'Unknown Event',
      createdAt: product.createdAt.toISOString().split('T')[0],
      updatedAt: product.updatedAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}