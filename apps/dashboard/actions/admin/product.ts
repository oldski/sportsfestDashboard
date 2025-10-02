'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, eq } from '@workspace/database/client';
import { productTable, ProductType, ProductStatus } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

const productSchema = z.object({
  categoryId: z.string().uuid('Category is required'),
  eventYearId: z.string().uuid('Event year is required'),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  image: z.string().optional(),
  type: z.nativeEnum(ProductType, {
    required_error: 'Product type is required',
  }),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  basePrice: z.number().min(0, 'Price must be 0 or greater'),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().min(0, 'Deposit amount must be 0 or greater').optional(),
  maxQuantityPerOrg: z.number().int().min(1).optional(),
  totalInventory: z.number().int().min(0).optional(),
  displayOrder: z.number().int().min(0, 'Display order must be 0 or greater').default(0),
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

  try {
    const validatedData = productSchema.parse(data);

    const result = await db
      .insert(productTable)
      .values(validatedData)
      .returning({
        id: productTable.id,
        name: productTable.name,
        categoryId: productTable.categoryId,
        eventYearId: productTable.eventYearId
      });

    revalidatePath('/admin/event-registration/products');
    return { success: true, product: result[0] };
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

  try {
    const validatedData = productSchema.parse(data);

    const result = await db
      .update(productTable)
      .set(validatedData)
      .where(eq(productTable.id, id))
      .returning({
        id: productTable.id,
        name: productTable.name,
        categoryId: productTable.categoryId,
        eventYearId: productTable.eventYearId
      });

    if (!result || result.length === 0) {
      throw new Error('Product not found');
    }

    revalidatePath('/admin/event-registration/products');
    return { success: true, product: result[0] };
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