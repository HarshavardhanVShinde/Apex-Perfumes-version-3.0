import { sql } from './db';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_price: number;
  product_images: string[];
  product_category: string;
  product_stock: number;
  is_on_sale: boolean;
  created_at: string;
}

// Get user's wishlist items
export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  const items = await sql`
    SELECT * FROM public.wishlist_items_view
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return items.map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_brand: item.product_brand,
    product_price: parseFloat(item.product_price),
    product_images: item.product_images,
    product_category: item.product_category,
    product_stock: item.product_stock,
    is_on_sale: item.is_on_sale,
    created_at: item.created_at,
  }));
}

// Add item to wishlist
export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    await sql`
      SELECT public.add_to_wishlist(
        ${userId}::text,
        ${productId}::uuid
      )
    `;
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

// Remove item from wishlist
export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    await sql`
      SELECT public.remove_from_wishlist(
        ${userId}::text,
        ${productId}::uuid
      )
    `;
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

// Check if product is in wishlist
export async function isProductInWishlist(userId: string, productId: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM public.wishlist_items
    WHERE user_id = ${userId}
      AND product_id = ${productId}::uuid
    LIMIT 1
  `;

  return result.length > 0;
}

// Clear entire wishlist
export async function clearWishlist(userId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM public.wishlist_items WHERE user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
}

// Get wishlist count
export async function getWishlistCount(userId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*)::integer AS total
    FROM public.wishlist_items
    WHERE user_id = ${userId}
  `;

  return result[0]?.total || 0;
}
