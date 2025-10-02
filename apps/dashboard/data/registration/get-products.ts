'use server';

import { cache } from 'react';
import { db, sql } from '@workspace/database/client';

import { getCurrentEventYear } from '~/data/event-years/get-current-event-year';
import { getProductAvailability } from '~/data/registration/get-product-availability';
import type { RegistrationProductDto } from '~/types/dtos/registration-product-dto';

export const getRegistrationProducts = cache(async (organizationSlug: string): Promise<RegistrationProductDto[]> => {

  try {
    const currentEventYear = await getCurrentEventYear();
    if (!currentEventYear) {
      console.log('No current event year, returning empty array');
      return [];
    }

    // Use raw SQL to bypass Drizzle ORM issues
    const result = await db.execute(sql`
      SELECT
        p.id,
        p.name,
        p.description,
        p.type,
        p.status,
        p."basePrice",
        p."requiresDeposit",
        p."depositAmount",
        p."maxQuantityPerOrg",
        p."totalInventory",
        p."displayOrder",
        p."categoryId",
        pc.name as "categoryName",
        p."eventYearId",
        p."createdAt",
        p."updatedAt",
        p."image"
      FROM "product" p
      LEFT JOIN "productCategory" pc ON p."categoryId" = pc.id
      WHERE p."eventYearId" = ${currentEventYear.id}
        AND p.status = 'active'
      ORDER BY p."displayOrder" ASC, p.name ASC
    `);

    console.log('SQL query executed successfully!');
    const products = result.rows;
    console.log('Raw products from DB:', products.length);
    console.log('First product (if any):', products[0]);

    // Get availability info for all products for this organization
    const availabilityData = await getProductAvailability(organizationSlug, currentEventYear.id as string);
    const availabilityMap = new Map(
      availabilityData.map(item => [item.productId, item])
    );

    return products.map((product: any) => {
      const availability = availabilityMap.get(product.id as string);

      return {
        id: product.id as string,
        name: product.name as string,
        description: product.description as string | undefined,
        type: product.type as RegistrationProductDto['type'],
        status: product.status as RegistrationProductDto['status'],
        basePrice: product.basePrice as number,
        requiresDeposit: product.requiresDeposit as boolean,
        depositAmount: product.depositAmount as number | undefined,
        maxQuantityPerOrg: product.maxQuantityPerOrg as number | undefined,
        totalInventory: product.totalInventory as number | undefined,
        image: product.image as string | undefined,
        createdAt: product.createdAt as Date,
        updatedAt: product.updatedAt as Date,
        category: {
          id: product.categoryId as string,
          name: (product.categoryName as string) || 'Unknown Category',
          description: undefined, // TODO: Add category description if needed
        },
        organizationPrice: undefined, // TODO: Add organization-specific pricing if needed
        // Add availability information
        availableQuantity: availability?.availableQuantity ?? null,
        purchasedQuantity: availability?.purchasedQuantity ?? 0,
      };
    });
  } catch (error) {
    console.error('Error in getRegistrationProducts:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
});
