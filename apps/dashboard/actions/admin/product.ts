'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, eq } from '@workspace/database/client';
import { eventYearTable, productTable, ProductType, ProductStatus } from '@workspace/database/schema';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';

async function assertProductBelongsToActiveYear(productId: string): Promise<void> {
  const [product] = await db
    .select({ eventYearId: productTable.eventYearId })
    .from(productTable)
    .where(eq(productTable.id, productId))
    .limit(1);

  if (!product) {
    throw new Error('Product not found');
  }

  const [activeYear] = await db
    .select({ id: eventYearTable.id })
    .from(eventYearTable)
    .where(eq(eventYearTable.isActive, true))
    .limit(1);

  if (!activeYear) {
    throw new Error('No active event year is configured');
  }

  if (product.eventYearId !== activeYear.id) {
    throw new Error('Only products in the active event year can be modified');
  }
}

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
    await assertProductBelongsToActiveYear(id);
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
    throw error instanceof Error ? error : new Error('Failed to update product. Please try again.');
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
    await assertProductBelongsToActiveYear(id);

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
    throw error instanceof Error ? error : new Error('Failed to remove product. Please try again.');
  }
}

const duplicateProductInputSchema = z.object({
  sourceProductId: z.string().uuid('Source product is required'),
  targetEventYearId: z.string().uuid('Target event year is required'),
});

export async function duplicateProduct(input: z.infer<typeof duplicateProductInputSchema>) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can duplicate products');
  }

  try {
    const { sourceProductId, targetEventYearId } = duplicateProductInputSchema.parse(input);

    const [source] = await db
      .select({
        categoryId: productTable.categoryId,
        name: productTable.name,
        description: productTable.description,
        image: productTable.image,
        type: productTable.type,
        basePrice: productTable.basePrice,
        requiresDeposit: productTable.requiresDeposit,
        depositAmount: productTable.depositAmount,
        maxQuantityPerOrg: productTable.maxQuantityPerOrg,
        totalInventory: productTable.totalInventory,
        displayOrder: productTable.displayOrder,
      })
      .from(productTable)
      .where(eq(productTable.id, sourceProductId))
      .limit(1);

    if (!source) {
      throw new Error('Source product not found');
    }

    const [targetYear] = await db
      .select({ id: eventYearTable.id })
      .from(eventYearTable)
      .where(eq(eventYearTable.id, targetEventYearId))
      .limit(1);

    if (!targetYear) {
      throw new Error('Target event year not found');
    }

    const [created] = await db
      .insert(productTable)
      .values({
        categoryId: source.categoryId,
        eventYearId: targetEventYearId,
        name: source.name,
        description: source.description,
        image: source.image,
        type: source.type,
        status: ProductStatus.ACTIVE,
        basePrice: source.basePrice,
        requiresDeposit: source.requiresDeposit,
        depositAmount: source.depositAmount,
        maxQuantityPerOrg: source.maxQuantityPerOrg,
        totalInventory: source.totalInventory,
        displayOrder: source.displayOrder ?? 0,
      })
      .returning({
        id: productTable.id,
        name: productTable.name,
        eventYearId: productTable.eventYearId,
      });

    revalidatePath('/admin/event-registration/products');
    return { success: true, product: created };
  } catch (error) {
    console.error('Error duplicating product:', error);
    throw error instanceof Error ? error : new Error('Failed to duplicate product. Please try again.');
  }
}