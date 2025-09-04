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
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotalDeposit: () => number;
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
        
        // Check max quantity constraint
        if (product.maxQuantityPerOrg && newQuantity > product.maxQuantityPerOrg) {
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
        if (product.maxQuantityPerOrg && quantity > product.maxQuantityPerOrg) {
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

  const removeItem = React.useCallback((productId: string) => {
    setItems(prev => {
      const removedItem = prev.find(item => item.productId === productId);
      if (removedItem) {
        toast.success(`Removed ${removedItem.product.name} from cart`);
      }
      return prev.filter(item => item.productId !== productId);
    });
  }, []);

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          // Check max quantity constraint
          if (item.product.maxQuantityPerOrg && quantity > item.product.maxQuantityPerOrg) {
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