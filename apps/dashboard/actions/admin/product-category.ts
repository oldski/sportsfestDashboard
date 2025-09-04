'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, eq } from '@workspace/database/client';
import { productCategoryTable } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

const productCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ProductCategoryFormData = z.infer<typeof productCategorySchema>;

export async function createProductCategory(data: ProductCategoryFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can create product categories');
  }

  const validatedData = productCategorySchema.parse(data);

  try {
    const [category] = await db
      .insert(productCategoryTable)
      .values(validatedData)
      .returning();

    revalidatePath('/admin/event-registration/products');
    return { success: true, category };
  } catch (error) {
    console.error('Error creating product category:', error);
    throw new Error('Failed to create product category. Please try again.');
  }
}

export async function updateProductCategory(id: string, data: ProductCategoryFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can update product categories');
  }

  const validatedData = productCategorySchema.parse(data);

  try {
    const [category] = await db
      .update(productCategoryTable)
      .set(validatedData)
      .where(eq(productCategoryTable.id, id))
      .returning();

    if (!category) {
      throw new Error('Product category not found');
    }

    revalidatePath('/admin/event-registration/products');
    return { success: true, category };
  } catch (error) {
    console.error('Error updating product category:', error);
    throw new Error('Failed to update product category. Please try again.');
  }
}

export async function deleteProductCategory(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can delete product categories');
  }

  try {
    const [category] = await db
      .update(productCategoryTable)
      .set({ isActive: false })
      .where(eq(productCategoryTable.id, id))
      .returning();

    if (!category) {
      throw new Error('Product category not found');
    }

    revalidatePath('/admin/event-registration/products');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product category:', error);
    throw new Error('Failed to remove product category. Please try again.');
  }
}