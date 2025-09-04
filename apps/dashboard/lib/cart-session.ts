import 'server-only';

import { cache } from 'react';
import { db, eq, and, gt, lt } from '@workspace/database/client';
import { cartSessionTable } from '@workspace/database/schema';
import type { CartItem } from '~/types/dtos/registration-product-dto';

// Generate a unique session ID (client-side only)
// This is now moved to the context file to avoid server-only import issues

// Calculate expiration date (24 hours from now)
function getExpirationDate(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}

// Get cart session by session ID
export const getCartSession = cache(async (sessionId: string) => {
  try {
    const sessions = await db
      .select()
      .from(cartSessionTable)
      .where(and(
        eq(cartSessionTable.sessionId, sessionId),
        gt(cartSessionTable.expiresAt, new Date()) // Only get non-expired sessions
      ))
      .limit(1);

    return sessions[0] || null;
  } catch (error) {
    console.error('Error fetching cart session:', error);
    return null;
  }
});

// Create or update cart session
export async function saveCartSession(
  sessionId: string,
  organizationId: string,
  cartItems: CartItem[],
  userId?: string
) {
  try {
    const cartData = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      useDeposit: item.useDeposit,
      unitPrice: item.unitPrice,
      depositPrice: item.depositPrice,
      totalPrice: item.totalPrice,
      // Store essential product info to handle cases where product changes
      productSnapshot: {
        name: item.product.name,
        basePrice: item.product.basePrice,
        requiresDeposit: item.product.requiresDeposit,
        depositAmount: item.product.depositAmount,
        maxQuantityPerOrg: item.product.maxQuantityPerOrg
      }
    }));

    // Use upsert pattern to handle duplicate key constraint
    try {
      await db
        .insert(cartSessionTable)
        .values({
          sessionId,
          organizationId,
          userId: userId || null,
          cartData: cartData as any,
          expiresAt: getExpirationDate()
        })
        .onConflictDoUpdate({
          target: cartSessionTable.sessionId,
          set: {
            cartData: cartData as any,
            expiresAt: getExpirationDate(),
            userId: userId || null,
            updatedAt: new Date()
          }
        });
    } catch (conflictError) {
      // Fallback to update if conflict resolution fails
      await db
        .update(cartSessionTable)
        .set({
          cartData: cartData as any,
          expiresAt: getExpirationDate(),
          userId: userId || null
        })
        .where(eq(cartSessionTable.sessionId, sessionId));
    }
  } catch (error) {
    console.error('Error saving cart session:', error);
    throw new Error('Failed to save cart session');
  }
}

// Load cart items from session
export async function loadCartItems(sessionId: string): Promise<CartItem[]> {
  try {
    const session = await getCartSession(sessionId);
    
    if (!session || !session.cartData) {
      return [];
    }

    // Note: In a real implementation, you'd want to re-validate product data
    // against the current database to handle price changes, availability, etc.
    const cartData = session.cartData as any[];
    
    return cartData.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      useDeposit: item.useDeposit,
      unitPrice: item.unitPrice,
      depositPrice: item.depositPrice,
      totalPrice: item.totalPrice,
      // This would need to be reconstructed from current product data in production
      product: item.productSnapshot ? {
        id: item.productId,
        name: item.productSnapshot.name,
        basePrice: item.productSnapshot.basePrice,
        requiresDeposit: item.productSnapshot.requiresDeposit,
        depositAmount: item.productSnapshot.depositAmount,
        maxQuantityPerOrg: item.productSnapshot.maxQuantityPerOrg,
        // Minimal product data - full product would be fetched if needed
        description: '',
        type: 'merchandise' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: '', name: '', description: '' },
        availableQuantity: null,
        purchasedQuantity: 0,
        organizationPrice: undefined,
        totalInventory: undefined
      } : {
        id: item.productId,
        name: 'Unknown Product',
        basePrice: item.unitPrice,
        requiresDeposit: false,
        description: '',
        type: 'merchandise' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: '', name: '', description: '' },
        availableQuantity: null,
        purchasedQuantity: 0,
        organizationPrice: undefined,
        totalInventory: undefined,
        depositAmount: null,
        maxQuantityPerOrg: null
      }
    }));
  } catch (error) {
    console.error('Error loading cart items:', error);
    return [];
  }
}

// Delete cart session
export async function deleteCartSession(sessionId: string) {
  try {
    await db
      .delete(cartSessionTable)
      .where(eq(cartSessionTable.sessionId, sessionId));
  } catch (error) {
    console.error('Error deleting cart session:', error);
  }
}

// Cleanup expired cart sessions (to be called periodically)
export async function cleanupExpiredCartSessions() {
  try {
    const now = new Date();
    const result = await db
      .delete(cartSessionTable)
      .where(lt(cartSessionTable.expiresAt, now));
    
    console.log(`Cleaned up expired cart sessions`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired cart sessions:', error);
    throw error;
  }
}