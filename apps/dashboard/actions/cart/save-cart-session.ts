'use server';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { saveCartSession } from '~/lib/cart-session';
import type { CartItem } from '~/types/dtos/registration-product-dto';

export async function saveCartSessionAction(sessionId: string, cartItems: CartItem[]) {
  try {
    const ctx = await getAuthOrganizationContext();
    
    if (!ctx.organization) {
      throw new Error('Organization context required');
    }

    await saveCartSession(
      sessionId,
      ctx.organization.id,
      cartItems,
      ctx.session?.user?.id
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error saving cart session:', error);
    return { success: false, error: 'Failed to save cart session' };
  }
}