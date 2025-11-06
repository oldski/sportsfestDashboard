'use server';

import { db, sql } from '@workspace/database/client';
import { getCompanyTeamCount } from '../../lib/inventory-management';

export interface ProductAvailability {
  productId: string;
  maxQuantityPerOrg: number | null;
  purchasedQuantity: number;
  availableQuantity: number | null; // null means unlimited
  isTentProduct?: boolean;
  requiresTeam?: boolean;
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

    // Get all products for current event year with their purchased quantities
    // Exclude abandoned orders (pending orders with no payments)
    const result = await db.execute(sql`
      SELECT
        p.id as "productId",
        p."maxQuantityPerOrg",
        p.type as "productType",
        COALESCE(SUM(
          CASE
            WHEN o."eventYearId" = ${currentEventYearId}
            AND o."organizationId" = ${organizationId}
            AND (
              o.status != 'pending'
              OR EXISTS (
                SELECT 1 FROM "orderPayment" op
                WHERE op."orderId" = o.id
                AND op.status = 'completed'
              )
            )
            THEN oi.quantity
            ELSE 0
          END
        ), 0) as "purchasedQuantity"
      FROM "product" p
      LEFT JOIN "orderItem" oi ON oi."productId" = p.id
      LEFT JOIN "order" o ON o.id = oi."orderId"
      WHERE p."eventYearId" = ${currentEventYearId}
        AND p.status = 'active'
      GROUP BY p.id, p."maxQuantityPerOrg", p.type
    `);

    // Get company team count for tent quota calculation
    // This includes both:
    // 1. Teams already created (fulfilled orders)
    // 2. Teams in paid/partially-paid orders (not yet fulfilled)
    const createdTeamCount = await getCompanyTeamCount(organizationId, currentEventYearId);

    // Count team purchases from paid orders (that may not be fulfilled yet)
    const purchasedTeamResult = await db.execute(sql`
      SELECT COALESCE(SUM(oi.quantity), 0) as "teamQuantity"
      FROM "orderItem" oi
      INNER JOIN "order" o ON o.id = oi."orderId"
      INNER JOIN "product" p ON p.id = oi."productId"
      WHERE p.type = 'team_registration'
        AND p."eventYearId" = ${currentEventYearId}
        AND o."organizationId" = ${organizationId}
        AND o."eventYearId" = ${currentEventYearId}
        AND (
          o.status != 'pending'
          OR EXISTS (
            SELECT 1 FROM "orderPayment" op
            WHERE op."orderId" = o.id
            AND op.status = 'completed'
          )
        )
    `);

    const purchasedTeamCount = parseInt(purchasedTeamResult.rows[0]?.teamQuantity as string) || 0;

    // Use the greater of created teams or purchased teams
    // This ensures that paid-but-not-fulfilled orders count toward tent quota
    const companyTeamCount = Math.max(createdTeamCount, purchasedTeamCount);

    return result.rows.map((row: any) => {
      const productType = row.productType as string;
      const isTentProduct = productType === 'tent_rental';
      const purchasedQuantity = parseInt(row.purchasedQuantity as string) || 0;

      let maxQuantityPerOrg: number | null;
      let availableQuantity: number | null;
      let requiresTeam = false;

      if (isTentProduct) {
        // For tent products, calculate dynamic quota based on company teams
        // 2 tents per company team
        requiresTeam = companyTeamCount === 0;
        maxQuantityPerOrg = companyTeamCount * 2;
        availableQuantity = Math.max(0, maxQuantityPerOrg - purchasedQuantity);
      } else {
        // For non-tent products, use the standard logic
        maxQuantityPerOrg = row.maxQuantityPerOrg as number | null;
        availableQuantity = maxQuantityPerOrg !== null
          ? Math.max(0, maxQuantityPerOrg - purchasedQuantity)
          : null; // null means unlimited
      }

      return {
        productId: row.productId as string,
        maxQuantityPerOrg,
        purchasedQuantity,
        availableQuantity,
        isTentProduct,
        requiresTeam
      };
    });

  } catch (error) {
    console.error('Error getting product availability:', error);
    return [];
  }
}