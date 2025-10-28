'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { toast } from '@workspace/ui/components/sonner';
import type { CartItem, RegistrationProductDto } from '~/types/dtos/registration-product-dto';
import { saveCartSessionAction } from '~/actions/cart/save-cart-session';
import { loadCartSessionAction } from '~/actions/cart/load-cart-session';
import { reserveInventory, releaseInventory, reserveTentInventoryBySlug } from '~/lib/inventory-management';
import { validateCouponCode } from '~/actions/admin/coupon-actions';

type AppliedCoupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  calculatedDiscount: number;
};

type ShoppingCartContextType = {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  cartValidationError: string | null;
  addItem: (product: RegistrationProductDto, quantity: number, useDeposit: boolean) => Promise<void>;
  removeItem: (productId: string, useDeposit?: boolean) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, useDeposit?: boolean) => Promise<void>;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotalDeposit: () => number;
  getDueToday: () => number;
  getFuturePayments: () => number;
  getCartTotal: () => number;
  getCouponDiscount: () => number;
  getDiscountedSubtotal: () => number;
  getDiscountedTotal: () => number;
  applyCoupon: (code: string, organizationId: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  getTeamCountInCart: () => number;
  getTentCountInCart: () => number;
  hasCartValidationErrors: () => boolean;
};

const ShoppingCartContext = React.createContext<ShoppingCartContextType | undefined>(undefined);

export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = React.useState<AppliedCoupon | null>(null);
  const [cartValidationError, setCartValidationError] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string>('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const params = useParams();

  // Helper: Count company teams in cart
  const getTeamCountInCart = React.useCallback(() => {
    return items
      .filter(item => item.product.type === 'team_registration')
      .reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Helper: Count tents in cart
  const getTentCountInCart = React.useCallback(() => {
    return items
      .filter(item => item.product.type === 'tent_rental')
      .reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Helper: Check if cart has validation errors
  const hasCartValidationErrors = React.useCallback(() => {
    return cartValidationError !== null;
  }, [cartValidationError]);

  // Generate a unique session ID (client-side)
  const generateSessionId = (): string => {
    return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Initialize session ID and load cart on mount
  React.useEffect(() => {
    const initializeCart = async () => {
      // Generate or get existing session ID from localStorage
      let currentSessionId = localStorage.getItem('cart_session_id');
      
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        localStorage.setItem('cart_session_id', currentSessionId);
      }
      
      setSessionId(currentSessionId);
      
      // Load existing cart items from database
      try {
        const savedItems = await loadCartSessionAction(currentSessionId);
        setItems(savedItems);
      } catch (error) {
        console.error('Error loading cart session:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeCart();
  }, []);

  // Save cart to database whenever items change
  React.useEffect(() => {
    if (!isLoaded || !sessionId) return;

    const saveCart = async () => {
      try {
        await saveCartSessionAction(sessionId, items);
      } catch (error) {
        console.error('Error saving cart session:', error);
      }
    };

    // Debounce saves to avoid too many database calls
    const timeoutId = setTimeout(saveCart, 1000);
    return () => clearTimeout(timeoutId);
  }, [items, sessionId, isLoaded]);

  const addItem = React.useCallback(async (product: RegistrationProductDto, quantity: number, useDeposit: boolean) => {
    // Reserve inventory first - use tent-specific logic for tent products
    let reservationResult;

    if (product.type === 'tent_rental') {
      // For tent products, check quota based on teams in cart
      const teamsInCart = getTeamCountInCart();
      const orgSlug = params.slug as string;

      reservationResult = await reserveTentInventoryBySlug(
        product.id,
        orgSlug,
        quantity,
        teamsInCart
      );
    } else {
      // For non-tent products, use standard inventory reservation
      reservationResult = await reserveInventory(product.id, quantity);
    }

    if (!reservationResult.success) {
      toast.error(reservationResult.error || 'Unable to reserve inventory');
      return;
    }

    setItems(prev => {
      const existingItemIndex = prev.findIndex(item =>
        item.productId === product.id && item.useDeposit === useDeposit
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        // Check available quantity first (takes precedence over max quantity)
        if (product.availableQuantity !== null && newQuantity > product.availableQuantity) {
          toast.error(`Only ${product.availableQuantity} available for your organization`);
          // Release the inventory we just reserved since we can't add it
          releaseInventory(product.id, quantity).catch(console.error);
          return prev;
        }
        // Fallback to max quantity constraint for products without availability system
        if (product.availableQuantity === null && product.maxQuantityPerOrg && newQuantity > product.maxQuantityPerOrg) {
          toast.error(`Maximum quantity for ${product.name} is ${product.maxQuantityPerOrg}`);
          // Release the inventory we just reserved since we can't add it
          releaseInventory(product.id, quantity).catch(console.error);
          return prev;
        }

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: newQuantity * existingItem.unitPrice
        };

        toast.success(`Updated ${product.name} quantity to ${newQuantity}`);
        return updatedItems;
      } else {
        // Add new item
        // Check available quantity first (takes precedence over max quantity)
        if (product.availableQuantity !== null && quantity > product.availableQuantity) {
          toast.error(`Only ${product.availableQuantity} available for your organization`);
          // Release the inventory we just reserved since we can't add it
          releaseInventory(product.id, quantity).catch(console.error);
          return prev;
        }
        // Fallback to max quantity constraint for products without availability system
        if (product.availableQuantity === null && product.maxQuantityPerOrg && quantity > product.maxQuantityPerOrg) {
          toast.error(`Maximum quantity for ${product.name} is ${product.maxQuantityPerOrg}`);
          // Release the inventory we just reserved since we can't add it
          releaseInventory(product.id, quantity).catch(console.error);
          return prev;
        }

        const unitPrice = useDeposit && product.requiresDeposit && product.depositAmount
          ? product.depositAmount
          : (product.organizationPrice?.customPrice || product.basePrice);

        const depositPrice = product.requiresDeposit && product.depositAmount
          ? product.depositAmount
          : 0;

        const newItem: CartItem = {
          productId: product.id,
          product,
          quantity,
          useDeposit,
          unitPrice,
          depositPrice,
          totalPrice: quantity * unitPrice
        };

        toast.success(`Added ${product.name} to cart`);
        return [...prev, newItem];
      }
    });
  }, [getTeamCountInCart, params.slug]);

  const removeItem = React.useCallback(async (productId: string, useDeposit?: boolean) => {
    // Get the item(s) to be removed first so we can release their inventory
    const itemsToRemove = items.filter(item => {
      if (useDeposit !== undefined) {
        return item.productId === productId && item.useDeposit === useDeposit;
      } else {
        return item.productId === productId;
      }
    });

    // Check if removing a team product would violate tent quota
    const isRemovingTeam = itemsToRemove.some(item => item.product.type === 'team_registration');
    if (isRemovingTeam) {
      const teamsBeingRemoved = itemsToRemove
        .filter(item => item.product.type === 'team_registration')
        .reduce((total, item) => total + item.quantity, 0);

      const currentTeamsInCart = getTeamCountInCart();
      const newTeamsInCart = currentTeamsInCart - teamsBeingRemoved;
      const tentsInCart = getTentCountInCart();
      const maxTentsAllowed = newTeamsInCart * 2;

      if (tentsInCart > maxTentsAllowed) {
        // Set validation error and show warning
        const errorMsg = `Cannot remove team - you have ${tentsInCart} tent${tentsInCart !== 1 ? 's' : ''} in cart but would only be allowed ${maxTentsAllowed} (${newTeamsInCart} team${newTeamsInCart !== 1 ? 's' : ''} × 2 tents). Please remove tents first.`;
        setCartValidationError(errorMsg);
        toast.warning(errorMsg);
        return;
      }
    }

    // Clear any previous validation errors when successfully removing
    setCartValidationError(null);

    // Release inventory for removed items
    for (const item of itemsToRemove) {
      await releaseInventory(item.productId, item.quantity);
    }

    setItems(prev => {
      let removedItem;
      if (useDeposit !== undefined) {
        // Remove specific item by productId and useDeposit
        removedItem = prev.find(item => item.productId === productId && item.useDeposit === useDeposit);
        if (removedItem) {
          toast.success(`Removed ${removedItem.product.name} from cart`);
        }
        return prev.filter(item => !(item.productId === productId && item.useDeposit === useDeposit));
      } else {
        // Remove all items with this productId (backward compatibility)
        removedItem = prev.find(item => item.productId === productId);
        if (removedItem) {
          toast.success(`Removed ${removedItem.product.name} from cart`);
        }
        return prev.filter(item => item.productId !== productId);
      }
    });
  }, [items, getTeamCountInCart, getTentCountInCart]);

  const updateQuantity = React.useCallback(async (productId: string, quantity: number, useDeposit?: boolean) => {
    if (quantity <= 0) {
      await removeItem(productId, useDeposit);
      return;
    }

    // Find the current item to determine quantity difference
    const currentItem = items.find(item => {
      return useDeposit !== undefined
        ? (item.productId === productId && item.useDeposit === useDeposit)
        : (item.productId === productId);
    });

    if (!currentItem) {
      return;
    }

    const quantityDifference = quantity - currentItem.quantity;

    if (quantityDifference > 0) {
      // Need to reserve more inventory
      const reservationResult = await reserveInventory(productId, quantityDifference);
      if (!reservationResult.success) {
        toast.error(reservationResult.error || 'Unable to reserve additional inventory');
        return;
      }
    } else if (quantityDifference < 0) {
      // Need to release some inventory
      await releaseInventory(productId, Math.abs(quantityDifference));
    }

    setItems(prev => {
      return prev.map(item => {
        const shouldUpdate = useDeposit !== undefined
          ? (item.productId === productId && item.useDeposit === useDeposit)
          : (item.productId === productId);

        if (shouldUpdate) {
          // Check available quantity first (takes precedence over max quantity)
          if (item.product.availableQuantity !== null && quantity > item.product.availableQuantity) {
            toast.error(`Only ${item.product.availableQuantity} available for your organization`);
            // If we reserved inventory but can't use it, release it
            if (quantityDifference > 0) {
              releaseInventory(productId, quantityDifference).catch(console.error);
            }
            return item;
          }
          // Fallback to max quantity constraint for products without availability system
          if (item.product.availableQuantity === null && item.product.maxQuantityPerOrg && quantity > item.product.maxQuantityPerOrg) {
            toast.error(`Maximum quantity for ${item.product.name} is ${item.product.maxQuantityPerOrg}`);
            // If we reserved inventory but can't use it, release it
            if (quantityDifference > 0) {
              releaseInventory(productId, quantityDifference).catch(console.error);
            }
            return item;
          }

          return {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice
          };
        }
        return item;
      });
    });
  }, [removeItem, items]);

  const clearCart = React.useCallback(async () => {
    // Release inventory for all items before clearing
    for (const item of items) {
      await releaseInventory(item.productId, item.quantity);
    }

    setItems([]);

    // Clear from database as well
    if (sessionId) {
      try {
        await saveCartSessionAction(sessionId, []);
      } catch (error) {
        console.error('Error clearing cart session:', error);
      }
    }

    toast.success('Shopping cart cleared');
  }, [sessionId, items]);

  const getItemCount = React.useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = React.useCallback(() => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  }, [items]);

  const getTotalDeposit = React.useCallback(() => {
    return items
      .filter(item => item.useDeposit)
      .reduce((total, item) => total + item.totalPrice, 0);
  }, [items]);

  const getDueToday = React.useCallback(() => {
    return items.reduce((total, item) => {
      if (item.useDeposit) {
        // For deposit items, only the deposit amount is due today
        return total + item.totalPrice;
      } else {
        // For non-deposit items, the full amount is due today
        return total + item.totalPrice;
      }
    }, 0);
  }, [items]);

  const getFuturePayments = React.useCallback(() => {
    return items
      .filter(item => item.useDeposit && item.product.requiresDeposit)
      .reduce((total, item) => {
        const fullPrice = item.product.organizationPrice?.customPrice || item.product.basePrice;
        const futureAmount = (fullPrice - item.depositPrice) * item.quantity;
        return total + futureAmount;
      }, 0);
  }, [items]);

  const getCartTotal = React.useCallback(() => {
    return items.reduce((total, item) => {
      if (item.useDeposit && item.product.requiresDeposit) {
        // For deposit items, total includes the full price
        const fullPrice = item.product.organizationPrice?.customPrice || item.product.basePrice;
        return total + (fullPrice * item.quantity);
      }
      return total + item.totalPrice;
    }, 0);
  }, [items]);

  // Coupon-related functions
  const getCouponDiscount = React.useCallback(() => {
    return appliedCoupon?.calculatedDiscount || 0;
  }, [appliedCoupon]);

  const getDiscountedSubtotal = React.useCallback(() => {
    const subtotal = getSubtotal();
    const discount = getCouponDiscount();
    return Math.max(0, subtotal - discount);
  }, [getSubtotal, getCouponDiscount]);

  const getDiscountedTotal = React.useCallback(() => {
    const total = getCartTotal();
    const discount = getCouponDiscount();
    return Math.max(0, total - discount);
  }, [getCartTotal, getCouponDiscount]);

  const applyCoupon = React.useCallback(async (code: string, organizationId: string) => {
    try {
      const subtotal = getSubtotal();
      if (subtotal === 0) {
        return { success: false, error: 'Add items to cart before applying a coupon' };
      }

      const result = await validateCouponCode(code, organizationId, subtotal);

      if (result.success && result.data) {
        setAppliedCoupon({
          id: result.data.id,
          code: code,
          discountType: result.data.discountType,
          discountValue: result.data.discountValue,
          calculatedDiscount: result.data.calculatedDiscount
        });
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Invalid coupon code' };
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, error: 'Failed to apply coupon. Please try again.' };
    }
  }, [getSubtotal]);

  const removeCoupon = React.useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const value = React.useMemo(() => ({
    items,
    appliedCoupon,
    cartValidationError,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotalDeposit,
    getDueToday,
    getFuturePayments,
    getCartTotal,
    getCouponDiscount,
    getDiscountedSubtotal,
    getDiscountedTotal,
    applyCoupon,
    removeCoupon,
    getTeamCountInCart,
    getTentCountInCart,
    hasCartValidationErrors
  }), [
    items,
    appliedCoupon,
    cartValidationError,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotalDeposit,
    getDueToday,
    getFuturePayments,
    getCartTotal,
    getCouponDiscount,
    getDiscountedSubtotal,
    getDiscountedTotal,
    applyCoupon,
    removeCoupon,
    getTeamCountInCart,
    getTentCountInCart,
    hasCartValidationErrors
  ]);

  return (
    <ShoppingCartContext.Provider value={value}>
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = React.useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
}