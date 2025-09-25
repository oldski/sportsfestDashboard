'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { toast } from '@workspace/ui/components/sonner';
import type { CartItem, RegistrationProductDto } from '~/types/dtos/registration-product-dto';
import { saveCartSessionAction } from '~/actions/cart/save-cart-session';
import { loadCartSessionAction } from '~/actions/cart/load-cart-session';

type ShoppingCartContextType = {
  items: CartItem[];
  addItem: (product: RegistrationProductDto, quantity: number, useDeposit: boolean) => void;
  removeItem: (productId: string, useDeposit?: boolean) => void;
  updateQuantity: (productId: string, quantity: number, useDeposit?: boolean) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotalDeposit: () => number;
  getDueToday: () => number;
  getFuturePayments: () => number;
  getCartTotal: () => number;
};

const ShoppingCartContext = React.createContext<ShoppingCartContextType | undefined>(undefined);

export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [sessionId, setSessionId] = React.useState<string>('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const params = useParams();

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

  const addItem = React.useCallback((product: RegistrationProductDto, quantity: number, useDeposit: boolean) => {
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
          return prev;
        }
        // Fallback to max quantity constraint for products without availability system
        if (product.availableQuantity === null && product.maxQuantityPerOrg && newQuantity > product.maxQuantityPerOrg) {
          toast.error(`Maximum quantity for ${product.name} is ${product.maxQuantityPerOrg}`);
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
          return prev;
        }
        // Fallback to max quantity constraint for products without availability system
        if (product.availableQuantity === null && product.maxQuantityPerOrg && quantity > product.maxQuantityPerOrg) {
          toast.error(`Maximum quantity for ${product.name} is ${product.maxQuantityPerOrg}`);
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
  }, []);

  const removeItem = React.useCallback((productId: string, useDeposit?: boolean) => {
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
  }, []);

  const updateQuantity = React.useCallback((productId: string, quantity: number, useDeposit?: boolean) => {
    if (quantity <= 0) {
      removeItem(productId, useDeposit);
      return;
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
            return item;
          }
          // Fallback to max quantity constraint for products without availability system
          if (item.product.availableQuantity === null && item.product.maxQuantityPerOrg && quantity > item.product.maxQuantityPerOrg) {
            toast.error(`Maximum quantity for ${item.product.name} is ${item.product.maxQuantityPerOrg}`);
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
  }, [removeItem]);

  const clearCart = React.useCallback(async () => {
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
  }, [sessionId]);

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

  const value = React.useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotalDeposit,
    getDueToday,
    getFuturePayments,
    getCartTotal
  }), [
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotalDeposit,
    getDueToday,
    getFuturePayments,
    getCartTotal
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