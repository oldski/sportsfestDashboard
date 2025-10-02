'use server';

import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';

import { decodeBase64Image, resizeImage } from '@workspace/common/image';
import type { Maybe } from '@workspace/common/maybe';
import { db, eq } from '@workspace/database/client';
import { productImageTable, productTable } from '@workspace/database/schema';
import { getProductImageUrl } from '@workspace/routes';
import { auth } from '@workspace/auth';
import { isSuperAdmin } from '~/lib/admin-utils';
import { FileUploadAction } from '~/lib/file-upload';
import { updateProductImageSchema } from '~/schemas/admin/update-product-image-schema';

export async function updateProductImage(productId: string, data: { action: FileUploadAction; image?: string }) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (!isSuperAdmin(session.user)) {
    throw new Error('Unauthorized: Only super admins can update product images');
  }

  const validatedData = updateProductImageSchema.parse(data);
  let image: Maybe<string> = undefined;

  if (validatedData.action === FileUploadAction.Update && validatedData.image) {
    const { buffer, mimeType } = decodeBase64Image(validatedData.image);
    const data = await resizeImage(buffer, mimeType);
    const hash = createHash('sha256').update(data).digest('hex');

    await db.transaction(async (tx) => {
      await tx
        .delete(productImageTable)
        .where(eq(productImageTable.productId, productId));

      await tx.insert(productImageTable).values({
        productId,
        data,
        contentType: mimeType,
        hash
      });
    });

    image = getProductImageUrl(productId, hash);
  }

  if (validatedData.action === FileUploadAction.Delete) {
    await db
      .delete(productImageTable)
      .where(eq(productImageTable.productId, productId));
    image = null;
  }

  await db
    .update(productTable)
    .set({ image: image })
    .where(eq(productTable.id, productId));

  revalidatePath('/admin/event-registration/products');
  return { success: true };
}
