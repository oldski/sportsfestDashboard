import { NextRequest, NextResponse } from 'next/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';
import { validate as uuidValidate } from 'uuid';

import { db, eq } from '@workspace/database/client';
import { productImageTable } from '@workspace/database/schema';

const paramsCache = createSearchParamsCache({
  productId: parseAsString.withDefault('')
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<NextParams> }
): Promise<Response> {
  const { productId } = await paramsCache.parse(props.params);
  if (!uuidValidate(productId)) {
    return new NextResponse(undefined, {
      status: 400,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }

  const [productImage] = await db.transaction(
    async (tx) =>
      await tx
        .select({
          data: productImageTable.data,
          contentType: productImageTable.contentType,
          hash: productImageTable.hash
        })
        .from(productImageTable)
        .where(eq(productImageTable.productId, productId)),
    { isolationLevel: 'read uncommitted' }
  );

  if (!productImage || !productImage.data) {
    return new NextResponse(undefined, {
      status: 404,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }

  const { searchParams } = new URL(req.url);
  const version = searchParams.get('v');
  if (version && version !== productImage.hash) {
    return new NextResponse(undefined, {
      status: 400,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }

  return new NextResponse(productImage.data, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=86400, immutable',
      'Content-Type': productImage.contentType ?? 'image/png',
      'Content-Length': productImage.data.length.toString()
    }
  });
}