'use server';

import { db, eq, and } from '@workspace/database/client';
import { productTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import type { ProductFormData } from './product';

export async function getProduct(id: string): Promise<ProductFormData & { id: string } | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can access products');
  }

  try {
    const [product] = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, id));

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      categoryId: product.categoryId,
      eventYearId: product.eventYearId,
      name: product.name,
      description: product.description || undefined,
      type: product.type,
      status: product.status,
      basePrice: product.basePrice,
      requiresDeposit: product.requiresDeposit,
      depositAmount: product.depositAmount || undefined,
      maxQuantityPerOrg: product.maxQuantityPerOrg || undefined,
      totalInventory: product.totalInventory || undefined,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}