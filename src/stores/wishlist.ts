import { create } from 'zustand';
import { storage } from '@/lib/storage';
import type { Product } from '@/types';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlistItems,
  isInWishlist,
  clearWishlist
} from '@/lib/supabase/wishlist';
import { useAuthStore } from '@/stores/auth';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  addItem: (product: Product) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<boolean>;
  loadWishlist: () => Promise<void>;
  toggleItem: (product: Product) => Promise<boolean>;
}

const WISHLIST_KEY = 'apex-wishlist';

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  addItem: async (product: Product) => {
    const user = useAuthStore.getState().user;
    
    if (user) {
      const success = await addToWishlist(user.id, product.id);
      if (success) {
        await get().loadWishlist();
        return true;
      }
      return false;
    } else {
      // For non-authenticated users, store in localStorage
      const currentItems = get().items;
      const exists = currentItems.find(item => item.id === product.id);
      
      if (!exists) {
        const newItems = [...currentItems, product];
        set({ items: newItems });
        storage.set(WISHLIST_KEY, newItems);
        return true;
      }
      return false;
    }
  },

  removeItem: async (productId: string) => {
    const user = useAuthStore.getState().user;
    
    if (user) {
      const success = await removeFromWishlist(user.id, productId);
      if (success) {
        await get().loadWishlist();
        return true;
      }
      return false;
    } else {
      // For non-authenticated users, remove from localStorage
      const newItems = get().items.filter(item => item.id !== productId);
      set({ items: newItems });
      storage.set(WISHLIST_KEY, newItems);
      return true;
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.id === productId);
  },

  clearWishlist: async () => {
    const user = useAuthStore.getState().user;
    
    if (user) {
      const success = await clearWishlist(user.id);
      if (success) {
        set({ items: [] });
        return true;
      }
      return false;
    } else {
      set({ items: [] });
      storage.remove(WISHLIST_KEY);
      return true;
    }
  },

  loadWishlist: async () => {
    const user = useAuthStore.getState().user;
    set({ isLoading: true });
    
    try {
      if (user) {
        const wishlistItems = await getWishlistItems(user.id);
        const products: Product[] = wishlistItems.map(item => ({
          id: item.product_id,
          name: item.product_name,
          brand: item.product_brand,
          price: item.product_price,
          originalPrice: undefined,
          images: item.product_images,
          category: item.product_category as Product['category'],
          type: item.product_type as Product['type'],
          notes: { top: [], heart: [], base: [] },
          longevity: 0,
          sillage: 'moderate' as const,
          rating: item.product_rating,
          stock: item.product_stock,
          description: item.product_description,
          isNew: item.is_new,
          isBestSeller: item.is_best_seller,
          isOnSale: item.is_on_sale,
        }));
        
        set({ items: products });
        
        // Sync local wishlist if exists
        const localWishlist = storage.get<Product[]>(WISHLIST_KEY) || [];
        if (localWishlist.length > 0) {
          // Add local items to server wishlist
          for (const product of localWishlist) {
            await addToWishlist(user.id, product.id);
          }
          storage.remove(WISHLIST_KEY);
          // Reload to get updated list
          await get().loadWishlist();
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedWishlist = storage.get<Product[]>(WISHLIST_KEY) || [];
        set({ items: savedWishlist });
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleItem: async (product: Product) => {
    const isCurrentlyInWishlist = get().isInWishlist(product.id);
    
    if (isCurrentlyInWishlist) {
      return await get().removeItem(product.id);
    } else {
      return await get().addItem(product);
    }
  },
}));