import { create } from 'zustand';
import { storage } from '@/lib/storage';
import type { Product, CartItem } from '@/types';
import { 
  addToCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart as clearSupabaseCart,
  getCartItems,
  syncCartFromLocalStorage
} from '@/lib/supabase/cart';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth';
import productsData from '@/data/products.json';

// Helper function to get product data from local JSON
function getProductFromLocalData(productId: string): any {
  return productsData.find(p => p.id === productId);
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  addItem: (product: Product, quantity?: number, selectedSize?: string) => Promise<void>;
  removeItem: (productId: string, selectedSize?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => Promise<void>;
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
  setItems: (items: CartItem[]) => void;
}

const CART_KEY = 'apex-cart';
const TAX_RATE = 0.08; // 8% tax rate

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  isSyncing: false,
  error: null,

  addItem: async (product: Product, quantity = 1, selectedSize = '100ml') => {
    try {
      set({ error: null });
      const user = useAuthStore.getState().user;
      
      if (user) {
        const success = await addToCart(user.id, product.id, quantity, selectedSize);
        if (success) {
          await get().loadCart();
        }
      } else {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          item => item.product.id === product.id && item.selectedSize === selectedSize
        );

        let newItems;
        if (existingItem) {
          newItems = currentItems.map(item =>
            item.product.id === product.id && item.selectedSize === selectedSize
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...currentItems, { 
            id: `${product.id}-${selectedSize}`, 
            product, 
            quantity,
            selectedSize
          }];
        }

        set({ items: newItems });
        storage.set(CART_KEY, newItems);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      set({ error: 'Failed to add item to cart' });
    }
  },

  removeItem: async (productId: string, selectedSize = '100ml') => {
    try {
      set({ error: null });
      const user = useAuthStore.getState().user;
      
      if (user) {
        const success = await removeFromCart(user.id, productId, selectedSize);
        if (success) {
          await get().loadCart();
        }
      } else {
        const newItems = get().items.filter(
          item => !(item.product.id === productId && item.selectedSize === selectedSize)
        );
        set({ items: newItems });
        storage.set(CART_KEY, newItems);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      set({ error: 'Failed to remove item from cart' });
    }
  },

  updateQuantity: async (productId: string, quantity: number, selectedSize = '100ml') => {
    try {
      set({ error: null });
      
      if (quantity <= 0) {
        await get().removeItem(productId, selectedSize);
        return;
      }

      const user = useAuthStore.getState().user;
      
      if (user) {
        const success = await updateCartItemQuantity(user.id, productId, quantity, selectedSize);
        if (success) {
          await get().loadCart();
        }
      } else {
        const newItems = get().items.map(item =>
          item.product.id === productId && item.selectedSize === selectedSize
            ? { ...item, quantity }
            : item
        );

        set({ items: newItems });
        storage.set(CART_KEY, newItems);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      set({ error: 'Failed to update cart quantity' });
    }
  },

  clearCart: async () => {
    try {
      set({ error: null });
      const user = useAuthStore.getState().user;
      
      if (user) {
        const success = await clearSupabaseCart(user.id);
        if (success) {
          set({ items: [] });
        }
      } else {
        set({ items: [] });
        storage.remove(CART_KEY);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      set({ error: 'Failed to clear cart' });
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },

  getTax: () => {
    return get().getSubtotal() * TAX_RATE;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTax();
  },

  loadCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = useAuthStore.getState().user;
      
      if (user) {
        const cartItems = await getCartItems(user.id);
        if (cartItems) {
          // Enhanced cart items with proper images from cart data first, then local data
          const mapped = cartItems.map(ci => {
            // Get enhanced product data from local JSON as backup
            const productData = getProductFromLocalData(ci.product_id);
            
            // Use cart item images first (from database view), then local data, then fallback
            const finalImages = (ci.product_images && ci.product_images.length > 0)
              ? ci.product_images
              : (productData?.images && productData.images.length > 0
                  ? productData.images
                  : ['/perfume-logo.png']);
            
            return {
              id: `${ci.product_id}-${ci.selected_size}`,
              quantity: ci.quantity,
              selectedSize: ci.selected_size,
              product: {
                id: ci.product_id,
                name: productData?.name || ci.product_name || 'Unknown Product',
                brand: productData?.brand || 'Aura Essence',
                price: ci.product_price,
                originalPrice: productData?.originalPrice,
                images: finalImages,
                category: productData?.category || 'unisex' as const,
                type: productData?.type || 'EDP',
                notes: productData?.notes || { top: [] as string[], heart: [] as string[], base: [] as string[] },
                longevity: productData?.longevity || 0,
                sillage: productData?.sillage || 'moderate' as const,
                rating: productData?.rating || 4.5,
                stock: productData?.stock || 25,
                description: productData?.description || `Premium ${productData?.type || 'EDP'} fragrance`,
                isNew: productData?.isNew || false,
                isBestSeller: productData?.isBestSeller || false,
                isOnSale: productData?.isOnSale || false,
              },
            };
          });
          set({ items: mapped });
          
          // Handle local storage sync
          const localCart = storage.get<CartItem[]>(CART_KEY) || [];
          if (localCart.length > 0) {
            const localCartItems = localCart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
            await syncCartFromLocalStorage(user.id, localCartItems);
            storage.remove(CART_KEY);
            const updatedCartItems = await getCartItems(user.id);
            if (updatedCartItems) {
              const updatedMapped = updatedCartItems.map(ci => {
                const productData = getProductFromLocalData(ci.product_id);
                
                // Use cart item images first (from database view), then local data, then fallback
                const finalImages = (ci.product_images && ci.product_images.length > 0)
                  ? ci.product_images
                  : (productData?.images && productData.images.length > 0
                      ? productData.images
                      : ['/perfume-logo.png']);
                
                return {
                  id: `${ci.product_id}-${ci.selected_size}`,
                  quantity: ci.quantity,
                  selectedSize: ci.selected_size,
                  product: {
                    id: ci.product_id,
                    name: productData?.name || ci.product_name || 'Unknown Product',
                    brand: productData?.brand || 'Aura Essence',
                    price: ci.product_price,
                    originalPrice: productData?.originalPrice,
                    images: finalImages,
                    category: productData?.category || 'unisex' as const,
                    type: productData?.type || 'EDP',
                    notes: productData?.notes || { top: [] as string[], heart: [] as string[], base: [] as string[] },
                    longevity: productData?.longevity || 0,
                    sillage: productData?.sillage || 'moderate' as const,
                    rating: productData?.rating || 4.5,
                    stock: productData?.stock || 25,
                    description: productData?.description || `Premium ${productData?.type || 'EDP'} fragrance`,
                    isNew: productData?.isNew || false,
                    isBestSeller: productData?.isBestSeller || false,
                    isOnSale: productData?.isOnSale || false,
                  },
                };
              });
              set({ items: updatedMapped });
            }
          }
        }
      } else {
        const savedCart = storage.get<CartItem[]>(CART_KEY) || [];
        set({ items: savedCart });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ error: 'Failed to load cart' });
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  setItems: (items: CartItem[]) => set({ items }),
}));
