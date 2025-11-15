import { create } from 'zustand';
import type { Product, CartItem } from '@/types';
const CART_CACHE_KEY = 'apex_cart_v1'

interface CartMutationOptions {
  skipReload?: boolean
}

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
  couponCode?: string;
  addItem: (product: Product, quantity?: number, selectedSize?: string, options?: CartMutationOptions) => Promise<void>;
  removeItem: (cartItemId: string, productId: string, selectedSize?: string | null, options?: CartMutationOptions) => Promise<void>;
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
  applyCoupon: (code: string) => Promise<void>;
  clearCoupon: () => Promise<void>;
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
    brand: 'Aura Élixir',
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
  couponCode: undefined,

  addItem: async (product: Product, quantity = 1, selectedSize = '20ml', options?: CartMutationOptions) => {
    try {
      set({ error: null });
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          productId: product.id,
          quantity,
          selectedSize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add item' }));
        throw new Error(errorData.error || 'Failed to add item to cart');
      }

      if (!options?.skipReload) {
        await get().loadCart();
      }
      // Don't auto-open cart, just update the count
    } catch (error) {
      console.error('Error adding item to cart:', error);
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      set({ error: message });
      throw error;
    }
  },

  removeItem: async (cartItemId: string, productId: string, selectedSize: string | null = null, options?: CartMutationOptions) => {
    try {
      set({ error: null });
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          cartItemId,
          productId,
          selectedSize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to remove item' }));
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }

      if (!options?.skipReload) {
        await get().loadCart();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      const message = error instanceof Error ? error.message : 'Failed to remove item from cart';
      set({ error: message });
      throw error;
    }
  },

  updateQuantity: async (cartItemId: string, productId: string, quantity: number, selectedSize: string | null = null) => {
    if (quantity <= 0) {
      await get().removeItem(cartItemId, productId, selectedSize);
      return;
    }

    try {
      set({ error: null });
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          cartItemId,
          productId,
          selectedSize,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update quantity' }));
        throw new Error(errorData.error || 'Failed to update cart quantity');
      }

      await get().loadCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      const message = error instanceof Error ? error.message : 'Failed to update cart quantity';
      set({ error: message });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      set({ error: null });
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to clear cart' }));
        throw new Error(errorData.error || 'Failed to clear cart');
      }

      set({ items: [], totals: EMPTY_TOTALS });
    } catch (error) {
      console.error('Error clearing cart:', error);
      const message = error instanceof Error ? error.message : 'Failed to clear cart';
      set({ error: message });
      throw error;
    }
  },

  openCart: () => {
    try {
      const cached = typeof window !== 'undefined' ? window.localStorage.getItem(CART_CACHE_KEY) : null
      if (cached) {
        const parsed = JSON.parse(cached)
        const items = Array.isArray(parsed.items) ? parsed.items : []
        const totals = parsed.totals && typeof parsed.totals === 'object' ? parsed.totals : EMPTY_TOTALS
        set({ items, totals })
      }
    } catch {}
    set({ isOpen: true });
  },

  closeCart: () => set({ isOpen: false, error: null }),

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => get().totals.subtotal,

  getTax: () => 0,

  getTotal: () => get().totals.total,

  loadCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const qs = get().couponCode ? `?coupon=${encodeURIComponent(get().couponCode as string)}` : '';
      const response = await fetch(`/api/cart${qs}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - clear cart
          set({ items: [], totals: EMPTY_TOTALS, isLoading: false });
          return;
        }
        throw new Error('Failed to load cart');
      }

      const data = await response.json();
      const cartItems = data.items || [];
      const totalsResponse = data.totals || data.summary || EMPTY_TOTALS;

      const mappedItems: CartItem[] = cartItems.map((ci: any) => {
        const imagesFromCart = ci.product_images && ci.product_images.length > 0 ? ci.product_images : null;

        const product: Product = buildFallbackProduct(
          ci.product_id,
          ci.product_name,
          ci.product_price,
          imagesFromCart
        );

        return {
          id: ci.id || `${ci.product_id}-${ci.selected_size ?? 'default'}`,
          product,
          quantity: ci.quantity,
          selectedSize: ci.selected_size,
          unitPrice: ci.product_price,
          lineTotal: ci.total_price,
        };
      });

      const resolvedTotals: CartTotalsState = {
        subtotal: totalsResponse.subtotal ?? 0,
        discount: totalsResponse.discount ?? 0,
        total: totalsResponse.total ?? 0,
        promotionText: totalsResponse.promotion_text ?? null,
      };

      set({ items: mappedItems, totals: resolvedTotals });
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            CART_CACHE_KEY,
            JSON.stringify({ items: mappedItems, totals: resolvedTotals })
          )
        }
      } catch {}
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ error: 'Failed to load cart', items: [], totals: EMPTY_TOTALS });
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  applyCoupon: async (code: string) => {
    set({ couponCode: code.trim() || undefined });
    await get().loadCart();
  },
  clearCoupon: async () => {
    set({ couponCode: undefined });
    await get().loadCart();
  },
}));
