'use server';

import { db, sql, eq, and } from '@workspace/database/client';
import { tentPurchaseTrackingTable, productTable, companyTeamTable, organizationTable, eventYearTable } from '@workspace/database/schema';

export interface InventoryResult {
  success: boolean;
  availableInventory?: number;
  error?: string;
}

/**
 * Get the count of company teams for an organization in a specific event year
 * Used to calculate tent quota (2 tents per company team)
 *
 * This now returns the MAXIMUM of:
 * 1. Created teams (fulfilled orders)
 * 2. Purchased teams (paid orders, even if not fulfilled yet)
 *
 * This ensures that users can purchase tents immediately after paying for teams,
 * without waiting for admin fulfillment.
 */
export async function getCompanyTeamCount(
  organizationId: string,
  eventYearId: string
): Promise<number> {
  try {
    // Count created teams (fulfilled orders)
    const createdResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(companyTeamTable)
      .where(
        and(
          eq(companyTeamTable.organizationId, organizationId),
          eq(companyTeamTable.eventYearId, eventYearId)
        )
      );

    const createdCount = createdResult[0]?.count || 0;

    // Count purchased teams from paid orders (may not be fulfilled yet)
    const purchasedResult = await db.execute(sql`
      SELECT COALESCE(SUM(oi.quantity), 0)::int as count
      FROM "orderItem" oi
      INNER JOIN "order" o ON o.id = oi."orderId"
      INNER JOIN "product" p ON p.id = oi."productId"
      WHERE p.type = 'team_registration'
        AND p."eventYearId" = ${eventYearId}
        AND o."organizationId" = ${organizationId}
        AND o."eventYearId" = ${eventYearId}
        AND (
          o.status != 'pending'
          OR EXISTS (
            SELECT 1 FROM "orderPayment" op
            WHERE op."orderId" = o.id
            AND op.status = 'completed'
          )
        )
    `);

    const purchasedCount = (purchasedResult as any)?.rows?.[0]?.count || 0;

    // Return the maximum to ensure tent quota is based on paid teams
    return Math.max(createdCount, purchasedCount);
  } catch (error) {
    console.error('Error getting company team count:', error);
    return 0;
  }
}

/**
 * Reserve inventory when adding items to cart
 */
export async function reserveInventory(productId: string, quantity: number): Promise<InventoryResult> {
  try {
    const result = await db.execute(sql`
      UPDATE product
      SET reservedcount = reservedcount + ${quantity}
      WHERE id = ${productId}
        AND ("totalInventory" - soldcount - reservedcount) >= ${quantity}
      RETURNING
        "totalInventory",
        soldcount,
        reservedcount,
        ("totalInventory" - soldcount - reservedcount) AS availableinventory
    `);

    const row = (result as any)?.rows?.[0];

    if (!row) {
      return {
        success: false,
        error: 'Insufficient inventory or product not found'
      };
    }

    return {
      success: true,
      availableInventory: Number(row.availableinventory)
    };
  } catch (error) {
    console.error('Error reserving inventory:', error);
    return {
      success: false,
      error: 'Database error while reserving inventory'
    };
  }
}

/**
 * Release reserved inventory when removing items from cart
 */
export async function releaseInventory(productId: string, quantity: number): Promise<InventoryResult> {
  try {
    const result = await db.execute(sql`
      UPDATE product
      SET reservedcount = GREATEST(0, reservedcount - ${quantity})
      WHERE id = ${productId}
      RETURNING
        "totalInventory",
        soldcount,
        reservedcount,
        ("totalInventory" - soldcount - reservedcount) AS availableinventory
    `);

    const row = (result as any)?.rows?.[0];

    return {
      success: true,
      availableInventory: row ? Number(row.availableInventory) : 0
    };
  } catch (error) {
    console.error('Error releasing inventory:', error);
    return {
      success: false,
      error: 'Database error while releasing inventory'
    };
  }
}

/**
 * Confirm inventory sale when payment completes
 * Moves from reserved to sold
 */
export async function confirmInventorySale(productId: string, quantity: number): Promise<InventoryResult> {
  try {
    const result = await db.execute(sql`
      UPDATE product
      SET
        reservedcount = GREATEST(0, reservedcount - ${quantity}),
        soldcount = soldcount + ${quantity}
      WHERE id = ${productId}
      RETURNING
        "totalInventory",
        soldcount,
        reservedcount,
        ("totalInventory" - soldcount - reservedcount) AS availableinventory
    `);

    const row = (result as any)?.rows?.[0];

    return {
      success: true,
      availableInventory: row ? Number(row.availableInventory) : 0
    };
  } catch (error) {
    console.error('Error confirming inventory sale:', error);
    return {
      success: false,
      error: 'Database error while confirming sale'
    };
  }
}

/**
 * Get current inventory status for a product
 */
export async function getInventoryStatus(productId: string) {
  try {
    const result = await db.execute(sql`
      SELECT
        id,
        name,
        "totalInventory",
        soldcount,
        reservedcount,
        ("totalInventory" - soldcount - reservedcount) AS availableinventory
      FROM product
      WHERE id = ${productId}
    `);

    const row = (result as any)?.rows?.[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      totalInventory: Number(row.totalInventory),
      soldCount: Number(row.soldcount),
      reservedCount: Number(row.reservedcount),
      availableInventory: Number(row.availableinventory)
    };
  } catch (error) {
    console.error('Error getting inventory status:', error);
    return null;
  }
}

/**
 * Tent-specific inventory management functions
 */

export interface TentTrackingResult {
  success: boolean;
  quantityPurchased?: number;
  remainingAllowed?: number;
  error?: string;
}

/**
 * Reserve tent inventory by organization slug (client-friendly wrapper)
 * @param teamsInCart - Number of company team items currently in cart (used for dynamic quota calculation)
 */
export async function reserveTentInventoryBySlug(
  productId: string,
  organizationSlug: string,
  quantity: number,
  teamsInCart: number = 0
): Promise<TentTrackingResult> {
  try {
    // Look up organization by slug
    const organization = await db
      .select({ id: organizationTable.id })
      .from(organizationTable)
      .where(eq(organizationTable.slug, organizationSlug))
      .limit(1);

    if (!organization[0]) {
      return {
        success: false,
        error: 'Organization not found'
      };
    }

    // Look up current event year
    const eventYear = await db
      .select({ id: eventYearTable.id })
      .from(eventYearTable)
      .where(eq(eventYearTable.isActive, true))
      .limit(1);

    if (!eventYear[0]) {
      return {
        success: false,
        error: 'Current event year not found'
      };
    }

    const org = {
      organizationId: organization[0].id,
      eventYearId: eventYear[0].id
    };

    // Call the main reserveTentInventory function
    return await reserveTentInventory(
      productId,
      org.organizationId as string,
      org.eventYearId as string,
      quantity,
      teamsInCart
    );
  } catch (error) {
    console.error('Error reserving tent inventory by slug:', error);
    console.error('Error details:', {
      productId,
      organizationSlug,
      quantity,
      teamsInCart,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    return { success: false, error: 'Database error while reserving tent inventory' };
  }
}

/**
 * Reserve tent inventory with quota checking
 * @param teamsInCart - Number of company team items currently in cart (used for dynamic quota calculation)
 */
export async function reserveTentInventory(
  productId: string,
  organizationId: string,
  eventYearId: string,
  quantity: number,
  teamsInCart: number = 0
): Promise<TentTrackingResult> {
  try {
    console.log('reserveTentInventory called with:', { productId, organizationId, eventYearId, quantity, teamsInCart });

    // Get count of purchased company teams
    const purchasedTeams = await getCompanyTeamCount(organizationId, eventYearId);
    console.log('Purchased teams:', purchasedTeams);

    // Calculate dynamic quota: 2 tents per company team (purchased + in cart)
    const totalTeams = purchasedTeams + teamsInCart;
    const maxAllowed = totalTeams * 2;

    // Must have at least one team to purchase tents
    if (totalTeams === 0) {
      return {
        success: false,
        error: 'Must have at least one company team purchased or in cart to purchase tents'
      };
    }

    // Get product inventory info
    const productResult = await db.execute(sql`
      SELECT "totalInventory", soldcount, reservedcount
      FROM product
      WHERE id = ${productId} AND type = 'tent_rental'
    `);

    const product = (productResult as any)?.rows?.[0];
    console.log('Product result:', product);

    if (!product) {
      return { success: false, error: 'Tent product not found' };
    }

    const availableInventory = Number(product.totalInventory) - Number(product.soldcount) - Number(product.reservedcount);
    console.log('Available inventory:', availableInventory);

    // Check if enough inventory is available
    if (availableInventory < quantity) {
      return { success: false, error: 'Insufficient tent inventory' };
    }

    // Check current purchases for this organization
    const currentTracking = await db
      .select()
      .from(tentPurchaseTrackingTable)
      .where(and(
        eq(tentPurchaseTrackingTable.organizationId, organizationId),
        eq(tentPurchaseTrackingTable.eventYearId, eventYearId),
        eq(tentPurchaseTrackingTable.tentProductId, productId)
      ))
      .limit(1);

    const currentPurchased = currentTracking[0]?.quantityPurchased || 0;

    // Note: We don't check reservedCount here because:
    // 1. reservedCount is global across all orgs, not org-specific
    // 2. The cart context already tracks tents in cart and calculates availability client-side
    // 3. We only validate against purchased tents here, as cart logic prevents over-adding

    // Check quota limit (only against purchased, not reserved)
    if (currentPurchased + quantity > maxAllowed) {
      return {
        success: false,
        error: `Exceeds tent limit. Max allowed: ${maxAllowed} (${totalTeams} team${totalTeams !== 1 ? 's' : ''} × 2 tents), Already purchased: ${currentPurchased}`
      };
    }

    // Reserve the inventory
    console.log('Calling reserveInventory with:', { productId, quantity });
    const reserveResult = await reserveInventory(productId, quantity);
    console.log('Reserve result:', reserveResult);

    if (!reserveResult.success) {
      return reserveResult;
    }

    return {
      success: true,
      quantityPurchased: currentPurchased,
      remainingAllowed: maxAllowed - currentPurchased - quantity
    };
  } catch (error) {
    console.error('Error reserving tent inventory:', error);
    console.error('Error details:', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    return { success: false, error: 'Database error while reserving tent inventory' };
  }
}

/**
 * Confirm tent sale - updates both inventory and tent tracking
 * Called after payment completion. At this point, team purchases in the order
 * will also be confirmed, so we only count purchased teams (not cart).
 */
export async function confirmTentSale(
  productId: string,
  organizationId: string,
  eventYearId: string,
  quantity: number
): Promise<TentTrackingResult> {
  try {
    // First confirm the inventory sale
    const inventoryResult = await confirmInventorySale(productId, quantity);
    if (!inventoryResult.success) {
      return inventoryResult;
    }

    // Get count of purchased company teams (includes teams in current order being confirmed)
    const purchasedTeams = await getCompanyTeamCount(organizationId, eventYearId);

    // Calculate dynamic quota: 2 tents per company team
    const maxAllowed = purchasedTeams * 2;

    // Update or create tent tracking record
    const existingTracking = await db
      .select()
      .from(tentPurchaseTrackingTable)
      .where(and(
        eq(tentPurchaseTrackingTable.organizationId, organizationId),
        eq(tentPurchaseTrackingTable.eventYearId, eventYearId),
        eq(tentPurchaseTrackingTable.tentProductId, productId)
      ))
      .limit(1);

    if (existingTracking[0]) {
      // Update existing record
      const newQuantity = existingTracking[0].quantityPurchased + quantity;
      const newRemaining = Math.max(0, maxAllowed - newQuantity);

      await db
        .update(tentPurchaseTrackingTable)
        .set({
          quantityPurchased: newQuantity,
          maxAllowed,
          remainingAllowed: newRemaining,
          companyTeamCount: purchasedTeams,
          updatedAt: new Date()
        })
        .where(eq(tentPurchaseTrackingTable.id, existingTracking[0].id));

      return {
        success: true,
        quantityPurchased: newQuantity,
        remainingAllowed: newRemaining
      };
    } else {
      // Create new tracking record
      const newRemaining = Math.max(0, maxAllowed - quantity);

      await db.insert(tentPurchaseTrackingTable).values({
        organizationId,
        eventYearId,
        tentProductId: productId,
        quantityPurchased: quantity,
        maxAllowed,
        remainingAllowed: newRemaining,
        companyTeamCount: purchasedTeams
      });

      return {
        success: true,
        quantityPurchased: quantity,
        remainingAllowed: newRemaining
      };
    }
  } catch (error) {
    console.error('Error confirming tent sale:', error);
    return { success: false, error: 'Database error while confirming tent sale' };
  }
}

/**
 * Get tent quota status for an organization
 * @param teamsInCart - Number of company team items currently in cart (used for dynamic quota calculation)
 */
export async function getTentQuotaStatus(
  productId: string,
  organizationId: string,
  eventYearId: string,
  teamsInCart: number = 0
) {
  try {
    const [tracking, product, purchasedTeams] = await Promise.all([
      db
        .select()
        .from(tentPurchaseTrackingTable)
        .where(and(
          eq(tentPurchaseTrackingTable.organizationId, organizationId),
          eq(tentPurchaseTrackingTable.eventYearId, eventYearId),
          eq(tentPurchaseTrackingTable.tentProductId, productId)
        ))
        .limit(1),
      db
        .select({
          totalInventory: productTable.totalInventory,
          soldCount: productTable.soldCount,
          reservedCount: productTable.reservedCount
        })
        .from(productTable)
        .where(eq(productTable.id, productId))
        .limit(1),
      getCompanyTeamCount(organizationId, eventYearId)
    ]);

    const trackingRecord = tracking[0];
    const productRecord = product[0];

    if (!productRecord) {
      return null;
    }

    // Calculate dynamic quota: 2 tents per company team (purchased + in cart)
    const totalTeams = purchasedTeams + teamsInCart;
    const maxAllowed = totalTeams * 2;
    const requiresTeam = totalTeams === 0;

    const quantityPurchased = trackingRecord?.quantityPurchased || 0;
    const remainingAllowed = Math.max(0, maxAllowed - quantityPurchased);
    const availableInventory = Number(productRecord.totalInventory) - Number(productRecord.soldCount) - Number(productRecord.reservedCount);

    return {
      quantityPurchased,
      maxAllowed,
      remainingAllowed,
      atQuotaLimit: remainingAllowed === 0,
      availableInventory,
      canPurchaseMore: !requiresTeam && remainingAllowed > 0 && availableInventory > 0,
      requiresTeam,
      teamCount: totalTeams
    };
  } catch (error) {
    console.error('Error getting tent quota status:', error);
    return null;
  }
}