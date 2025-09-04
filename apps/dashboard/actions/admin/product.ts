'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, eq, and } from '@workspace/database/client';
import { productTable, ProductType, ProductStatus } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

const productSchema = z.object({
  categoryId: z.string().uuid('Category is required'),
  eventYearId: z.string().uuid('Event year is required'),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType, {
    required_error: 'Product type is required',
  }),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  basePrice: z.number().min(0, 'Price must be 0 or greater'),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().min(0, 'Deposit amount must be 0 or greater').optional(),
  maxQuantityPerOrg: z.number().int().min(1).optional(),
  totalInventory: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.requiresDeposit && (!data.depositAmount || data.depositAmount <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount is required when deposit is required',
  path: ['depositAmount'],
}).refine((data) => {
  if (data.depositAmount && data.depositAmount >= data.basePrice) {
    return false;
  }
  return true;
}, {
  message: 'Deposit amount must be less than base price',
  path: ['depositAmount'],
});

export type ProductFormData = z.infer<typeof productSchema>;

export async function createProduct(data: ProductFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can create products');
  }

  const validatedData = productSchema.parse(data);

  try {
    const [product] = await db
      .insert(productTable)
      .values(validatedData)
      .returning();

    revalidatePath('/admin/event-registration/products');
    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product. Please try again.');
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can update products');
  }

  const validatedData = productSchema.parse(data);

  try {
    const [product] = await db
      .update(productTable)
      .set(validatedData)
      .where(eq(productTable.id, id))
      .returning();

    if (!product) {
      throw new Error('Product not found');
    }

    revalidatePath('/admin/event-registration/products');
    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product. Please try again.');
  }
}

export async function softDeleteProduct(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can delete products');
  }

  try {
    const [product] = await db
      .update(productTable)
      .set({ 
        status: ProductStatus.ARCHIVED,
      })
      .where(eq(productTable.id, id))
      .returning();

    if (!product) {
      throw new Error('Product not found or already deleted');
    }

    revalidatePath('/admin/event-registration/products');
    return { success: true };
  } catch (error) {
    console.error('Error soft deleting product:', error);
    throw new Error('Failed to remove product. Please try again.');
  }
}