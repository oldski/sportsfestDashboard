'use server';

import { db, sql } from '@workspace/database/client';

export interface ProductAvailability {
  productId: string;
  maxQuantityPerOrg: number | null;
  purchasedQuantity: number;
  availableQuantity: number | null; // null means unlimited
}

export async function getProductAvailability(
  organizationSlug: string,
  currentEventYearId: string
): Promise<ProductAvailability[]> {
  console.log('Getting product availability for org:', organizationSlug);

  try {
    // First get the organization ID from the slug
    const orgResult = await db.execute(sql`
      SELECT id FROM "organization" WHERE slug = ${organizationSlug} LIMIT 1
    `);

    if (orgResult.rows.length === 0) {
      console.log('Organization not found for slug:', organizationSlug);
      return [];
    }

    const organizationId = orgResult.rows[0].id as string;
    console.log('Found organization ID:', organizationId);

    // Get all products for current event year with their purchased quantities
    const result = await db.execute(sql`
      SELECT 
        p.id as "productId",
        p."maxQuantityPerOrg",
        COALESCE(SUM(oi.quantity), 0) as "purchasedQuantity"
      FROM "product" p
      LEFT JOIN "orderItem" oi ON oi."productId" = p.id
      LEFT JOIN "order" o ON o.id = oi."orderId" AND o."organizationId" = ${organizationId}
      WHERE p."eventYearId" = ${currentEventYearId}
        AND p.status = 'active'
      GROUP BY p.id, p."maxQuantityPerOrg"
    `);

    console.log('Product availability query returned:', result.rows.length, 'products');

    return result.rows.map((row: any) => {
      const maxQuantityPerOrg = row.maxQuantityPerOrg as number | null;
      const purchasedQuantity = parseInt(row.purchasedQuantity as string) || 0;
      
      const availableQuantity = maxQuantityPerOrg !== null 
        ? Math.max(0, maxQuantityPerOrg - purchasedQuantity)
        : null; // null means unlimited

      console.log(`Product ${row.productId}: max=${maxQuantityPerOrg}, purchased=${purchasedQuantity}, available=${availableQuantity}`);

      return {
        productId: row.productId as string,
        maxQuantityPerOrg,
        purchasedQuantity,
        availableQuantity
      };
    });

  } catch (error) {
    console.error('Error getting product availability:', error);
    return [];
  }
}