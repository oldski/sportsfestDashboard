'use server';

import { db, sql, eq, and } from '@workspace/database/client';
import { tentPurchaseTrackingTable, productTable } from '@workspace/database/schema';

export interface InventoryResult {
  success: boolean;
  availableInventory?: number;
  error?: string;
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
 * Reserve tent inventory with quota checking
 */
export async function reserveTentInventory(
  productId: string,
  organizationId: string,
  eventYearId: string,
  quantity: number
): Promise<TentTrackingResult> {
  try {
    // First, get the product's maxQuantityPerOrg
    const productResult = await db.execute(sql`
      SELECT "maxQuantityPerOrg", "totalInventory", soldcount, reservedcount
      FROM product
      WHERE id = ${productId} AND type = 'tent_rental'
    `);

    const product = (productResult as any)?.rows?.[0];
    if (!product) {
      return { success: false, error: 'Tent product not found' };
    }

    const maxAllowed = Number(product.maxQuantityPerOrg || 0);
    const availableInventory = Number(product.totalInventory) - Number(product.soldcount) - Number(product.reservedcount);

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

    // Check quota limit
    if (currentPurchased + quantity > maxAllowed) {
      return {
        success: false,
        error: `Exceeds organization limit. Max allowed: ${maxAllowed}, Current: ${currentPurchased}`
      };
    }

    // Reserve the inventory
    const reserveResult = await reserveInventory(productId, quantity);
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
    return { success: false, error: 'Database error while reserving tent inventory' };
  }
}

/**
 * Confirm tent sale - updates both inventory and tent tracking
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

    // Get the product's maxQuantityPerOrg
    const productResult = await db.execute(sql`
      SELECT "maxQuantityPerOrg"
      FROM product
      WHERE id = ${productId}
    `);

    const product = (productResult as any)?.rows?.[0];
    const maxAllowed = Number(product?.maxQuantityPerOrg || 0);

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
          remainingAllowed: newRemaining,
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
        remainingAllowed: newRemaining
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
 */
export async function getTentQuotaStatus(
  productId: string,
  organizationId: string,
  eventYearId: string
) {
  try {
    const [tracking, product] = await Promise.all([
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
          maxQuantityPerOrg: productTable.maxQuantityPerOrg,
          totalInventory: productTable.totalInventory,
          soldCount: productTable.soldcount,
          reservedCount: productTable.reservedcount
        })
        .from(productTable)
        .where(eq(productTable.id, productId))
        .limit(1)
    ]);

    const trackingRecord = tracking[0];
    const productRecord = product[0];

    if (!productRecord) {
      return null;
    }

    const maxAllowed = Number(productRecord.maxQuantityPerOrg || 0);
    const quantityPurchased = trackingRecord?.quantityPurchased || 0;
    const remainingAllowed = Math.max(0, maxAllowed - quantityPurchased);
    const availableInventory = Number(productRecord.totalInventory) - Number(productRecord.soldCount) - Number(productRecord.reservedCount);

    return {
      quantityPurchased,
      maxAllowed,
      remainingAllowed,
      atQuotaLimit: remainingAllowed === 0,
      availableInventory,
      canPurchaseMore: remainingAllowed > 0 && availableInventory > 0
    };
  } catch (error) {
    console.error('Error getting tent quota status:', error);
    return null;
  }
}