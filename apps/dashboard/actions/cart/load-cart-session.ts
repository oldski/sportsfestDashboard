'use server';

import { loadCartItems } from '~/lib/cart-session';
import type { CartItem } from '~/types/dtos/registration-product-dto';

export async function loadCartSessionAction(sessionId: string): Promise<CartItem[]> {
  try {
    return await loadCartItems(sessionId);
  } catch (error) {
    console.error('Error loading cart session:', error);
    return [];
  }
}