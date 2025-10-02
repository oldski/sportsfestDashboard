'use server';

import { db, eq, and } from '@workspace/database/client';
import {eventYearTable, productCategoryTable, productTable} from '@workspace/database/schema';
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
    const productData = await db
      .select({
      id: productTable.id,
      name: productTable.name,
      description: productTable.description,
      image: productTable.image,
      type: productTable.type,
      status: productTable.status,
      basePrice: productTable.basePrice,
      requiresDeposit: productTable.requiresDeposit,
      depositAmount: productTable.depositAmount,
      maxQuantityPerOrg: productTable.maxQuantityPerOrg,
      totalInventory: productTable.totalInventory,
      displayOrder: productTable.displayOrder,
      categoryId: productTable.categoryId,
      eventYearId: productTable.eventYearId,
      createdAt: productTable.createdAt,
      updatedAt: productTable.updatedAt,
    })
      .from(productTable)
      .where(eq(productTable.id, id));

    if (!productData || productData.length === 0) {
      return null;
    }

    const product = productData[0];

    return {
      id: product.id,
      categoryId: product.categoryId,
      eventYearId: product.eventYearId,
      name: product.name,
      description: product.description || undefined,
      image: product.image || undefined,
      type: product.type,
      status: product.status,
      basePrice: product.basePrice,
      requiresDeposit: product.requiresDeposit,
      depositAmount: product.depositAmount || undefined,
      maxQuantityPerOrg: product.maxQuantityPerOrg || undefined,
      totalInventory: product.totalInventory || undefined,
      displayOrder: product.displayOrder || 0,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to fetch product');
  }
}
