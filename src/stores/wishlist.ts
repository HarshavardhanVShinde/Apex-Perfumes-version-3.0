import { create } from 'zustand';
import { storage } from '@/lib/storage';
import type { Product } from '@/types';

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
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', productId: product.id }),
      });

      if (response.status === 401) {
        // Not authenticated - store in localStorage
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

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      await get().loadWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  },

  removeItem: async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', productId }),
      });

      if (response.status === 401) {
        // Not authenticated - remove from localStorage
        const newItems = get().items.filter(item => item.id !== productId);
        set({ items: newItems });
        storage.set(WISHLIST_KEY, newItems);
        return true;
      }

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      await get().loadWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some(item => item.id === productId);
  },

  clearWishlist: async () => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (response.status === 401) {
        // Not authenticated - clear localStorage
        set({ items: [] });
        storage.remove(WISHLIST_KEY);
        return true;
      }

      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }

      set({ items: [] });
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  },

  loadWishlist: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'GET',
      });

      if (response.status === 401) {
        // Not authenticated - load from localStorage
        const savedWishlist = storage.get<Product[]>(WISHLIST_KEY) || [];
        set({ items: savedWishlist });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load wishlist');
      }

      const data = await response.json();
      const wishlistItems = data.items || [];

      const products: Product[] = wishlistItems.map((item: any) => ({
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
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', productId: product.id }),
          });
        }
        storage.remove(WISHLIST_KEY);
        // Reload to get updated list
        await get().loadWishlist();
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Fallback to localStorage on error
      const savedWishlist = storage.get<Product[]>(WISHLIST_KEY) || [];
      set({ items: savedWishlist });
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