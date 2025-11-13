import { create } from 'zustand';
import type { Product, CartItem } from '@/types';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart as clearSupabaseCart,
  getCartItems,
  calculateCartTotal,
} from '@/lib/supabase/cart';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth';
import { mapProductRowToProduct } from '@/lib/supabase/mappers';

interface CartTotalsState {
  subtotal: number;
  discount: number;
  total: number;
  promotionText: string | null;
}

interface CartState {
  items: CartItem[];
  totals: CartTotalsState;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  addItem: (product: Product, quantity?: number, selectedSize?: string) => Promise<void>;
  removeItem: (cartItemId: string, productId: string, selectedSize?: string | null) => Promise<void>;
  updateQuantity: (cartItemId: string, productId: string, quantity: number, selectedSize?: string | null) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  loadCart: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const EMPTY_TOTALS: CartTotalsState = {
  subtotal: 0,
  discount: 0,
  total: 0,
  promotionText: null,
};

function buildFallbackProduct(
  productId: string,
  productName: string | null,
  price: number,
  images: string[] | null,
): Product {
  return {
    id: productId,
    name: productName || 'Unknown Product',
    brand: 'Aura Essence',
    price,
    images: images && images.length > 0 ? images : ['/perfume-logo.png'],
    category: 'unisex',
    type: 'EDP',
    notes: { top: [], heart: [], base: [] },
    longevity: 0,
    sillage: 'moderate',
    rating: 0,
    stock: 0,
    description: '',
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totals: EMPTY_TOTALS,
  isOpen: false,
  isLoading: false,
  error: null,

  addItem: async (product: Product, quantity = 1, selectedSize = '100ml') => {
    const user = useAuthStore.getState().user;

    if (!user) {
      const message = 'Please sign in to add items to your cart.';
      set({ error: message, isOpen: true });
      throw new Error(message);
    }

    try {
      set({ error: null });
      await addToCart(user.id, product.id, quantity, selectedSize);
      await get().loadCart();
      set({ isOpen: true });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      set({ error: 'Failed to add item to cart' });
      throw error;
    }
  },

  removeItem: async (cartItemId: string, productId: string, selectedSize: string | null = null) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      const message = 'Please sign in to manage your cart.';
      set({ error: message, isOpen: true });
      throw new Error(message);
    }

    try {
      set({ error: null });
      await removeFromCart({
        userId: user.id,
        cartItemId,
        productId,
        selectedSize,
      });
      await get().loadCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      set({ error: 'Failed to remove item from cart' });
      throw error;
    }
  },

  updateQuantity: async (cartItemId: string, productId: string, quantity: number, selectedSize: string | null = null) => {
    const user = useAuthStore.getState().user;

    if (!user) {
      const message = 'Please sign in to manage your cart.';
      set({ error: message, isOpen: true });
      throw new Error(message);
    }

    if (quantity <= 0) {
      await get().removeItem(cartItemId, productId, selectedSize);
      return;
    }

    try {
      set({ error: null });
      await updateCartItemQuantity({
        userId: user.id,
        cartItemId,
        productId,
        selectedSize,
        quantity,
      });
      await get().loadCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      set({ error: 'Failed to update cart quantity' });
      throw error;
    }
  },

  clearCart: async () => {
    const user = useAuthStore.getState().user;

    if (!user) {
      const message = 'Please sign in to manage your cart.';
      set({ error: message, isOpen: true });
      throw new Error(message);
    }

    try {
      set({ error: null });
      await clearSupabaseCart(user.id);
      set({ items: [], totals: EMPTY_TOTALS });
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ error: 'Failed to clear cart' });
      throw error;
    }
  },

  openCart: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ isOpen: true, error: 'Please sign in to view your cart.' });
    } else {
      set({ isOpen: true });
    }
  },

  closeCart: () => set({ isOpen: false, error: null }),

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => get().totals.subtotal,

  getTax: () => 0,

  getTotal: () => get().totals.total,

  loadCart: async () => {
    const user = useAuthStore.getState().user;

    if (!user) {
      set({ items: [], totals: EMPTY_TOTALS, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const cartItems = await getCartItems(user.id);
      const productIds = Array.from(new Set(cartItems.map(item => item.product_id))).filter(Boolean);

      let productMap = new Map<string, Product>();
      if (productIds.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds as string[]);

        if (error) {
          console.error('Error fetching products for cart:', error);
        } else if (data) {
          productMap = new Map(data.map(row => [row.id, mapProductRowToProduct(row)]));
        }
      }

      const mappedItems: CartItem[] = cartItems.map(ci => {
        const baseProduct = ci.product_id ? productMap.get(ci.product_id) : undefined;
        const imagesFromCart = ci.product_images && ci.product_images.length > 0 ? ci.product_images : null;

        const product: Product = baseProduct
          ? {
              ...baseProduct,
              price: ci.product_price,
              images: imagesFromCart ?? baseProduct.images,
            }
          : buildFallbackProduct(ci.product_id, ci.product_name, ci.product_price, imagesFromCart);

        return {
          id: ci.id || `${ci.product_id}-${ci.selected_size ?? 'default'}`,
          product,
          quantity: ci.quantity,
          selectedSize: ci.selected_size,
          unitPrice: ci.product_price,
          lineTotal: ci.total_price,
        };
      });

      const totalsResponse = await calculateCartTotal(user.id);

      const resolvedTotals: CartTotalsState = {
        subtotal: totalsResponse.subtotal ?? 0,
        discount: totalsResponse.discount ?? 0,
        total: totalsResponse.total ?? 0,
        promotionText: totalsResponse.promotion_text ?? null,
      };

      set({
        items: mappedItems,
        totals: resolvedTotals,
      });
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ error: 'Failed to load cart', items: [], totals: EMPTY_TOTALS });
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
