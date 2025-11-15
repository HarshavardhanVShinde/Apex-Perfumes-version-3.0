import { sql } from './db';

export interface CartItemWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string;
  product_name: string;
  product_brand: string;
  product_price: number;
  product_images: string[];
  product_category: string;
  product_stock: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  promotion_text: string | null;
}

// Ensure user profile exists in Neon DB
export async function ensureUserProfile(userId: string, userMetadata?: { displayName?: string; email?: string }) {
  try {
    const displayName = userMetadata?.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const email = userMetadata?.email || '';

    await sql`
      INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
      VALUES (${userId}, ${email}, ${displayName}, ${firstName}, ${lastName})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        updated_at = now()
    `;
  } catch (error) {
    console.warn('Error ensuring profile:', error);
    // Don't throw - allow cart operations to continue
  }
}

// Get user's cart items
export async function getCartItems(userId: string): Promise<CartItemWithProduct[]> {
  const items = await sql`
    SELECT * FROM public.cart_items_view
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return items.map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    quantity: item.quantity,
    selected_size: item.selected_size || '20ml',
    product_name: item.product_name,
    product_brand: item.product_brand,
    product_price: parseFloat(item.product_price),
    product_images: item.product_images,
    product_category: item.product_category,
    product_stock: item.product_stock,
    total_price: parseFloat(item.total_price),
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

// Add item to cart or update quantity if exists
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
  selectedSize: string = '20ml'
): Promise<boolean> {
  try {
    // Check if item already exists
    const existing = await sql`
      SELECT id, quantity FROM public.cart_items
      WHERE user_id = ${userId}
        AND product_id = ${productId}::uuid
        AND selected_size = ${selectedSize}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing item
      await sql`
        UPDATE public.cart_items
        SET quantity = quantity + ${quantity},
            updated_at = now()
        WHERE id = ${existing[0].id}::uuid
      `;
    } else {
      // Insert new item
      await sql`
        INSERT INTO public.cart_items (user_id, product_id, quantity, selected_size)
        VALUES (${userId}, ${productId}::uuid, ${quantity}, ${selectedSize})
      `;
    }

    return true;
  } catch (error) {
    console.error('❌ Error in addToCart:', error);
    throw error;
  }
}

// Remove item from cart
export interface RemoveCartItemOptions {
  userId: string;
  cartItemId?: string;
  productId?: string;
  selectedSize?: string | null;
}

export async function removeFromCart(options: RemoveCartItemOptions): Promise<boolean> {
  const { userId, cartItemId, productId, selectedSize } = options;

  try {
    if (cartItemId) {
      await sql`
        DELETE FROM public.cart_items
        WHERE id = ${cartItemId}::uuid
          AND user_id = ${userId}
      `;
    } else if (productId) {
      await sql`
        DELETE FROM public.cart_items
        WHERE user_id = ${userId}
          AND product_id = ${productId}::uuid
          AND selected_size = ${selectedSize || '100ml'}
      `;
    } else {
      throw new Error('removeFromCart requires a cartItemId or productId.');
    }

    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Update item quantity in cart
export interface UpdateCartQuantityOptions {
  userId: string;
  quantity: number;
  cartItemId?: string;
  productId?: string;
  selectedSize?: string | null;
}

export async function updateCartItemQuantity(options: UpdateCartQuantityOptions): Promise<boolean> {
  const { userId, quantity, cartItemId, productId, selectedSize } = options;

  if (quantity <= 0) {
    return await removeFromCart({ userId, cartItemId, productId, selectedSize });
  }

  try {
    if (cartItemId) {
      await sql`
        UPDATE public.cart_items
        SET quantity = ${quantity}::integer,
            updated_at = now()
        WHERE id = ${cartItemId}::uuid
          AND user_id = ${userId}
      `;
    } else if (productId) {
      await sql`
        UPDATE public.cart_items
        SET quantity = ${quantity}::integer,
            updated_at = now()
        WHERE user_id = ${userId}
          AND product_id = ${productId}::uuid
          AND selected_size = ${selectedSize || '100ml'}
      `;
    } else {
      throw new Error('updateCartItemQuantity requires a cartItemId or productId.');
    }

    return true;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
}

// Clear entire cart
export async function clearCart(userId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM public.cart_items
      WHERE user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Get cart summary
export async function getCartSummary(userId: string): Promise<{
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}> {
  const cartItems = await getCartItems(userId);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const itemCount = cartItems.length;

  return {
    totalItems,
    totalPrice,
    itemCount,
  };
}

// Check if product is in cart
export async function isProductInCart(userId: string, productId: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM public.cart_items
    WHERE user_id = ${userId}
      AND product_id = ${productId}::uuid
    LIMIT 1
  `;

  return result.length > 0;
}

// Get cart item quantity for a specific product
export async function getCartItemQuantity(userId: string, productId: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(quantity), 0)::integer AS total
    FROM public.cart_items
    WHERE user_id = ${userId}
      AND product_id = ${productId}::uuid
  `;

  return result[0]?.total || 0;
}

// Sync cart from local storage (for guest users)
export async function syncCartFromLocalStorage(
  userId: string,
  localCartItems: Array<{ productId: string; quantity: number }>
): Promise<void> {
  if (!localCartItems.length) {
    await clearCart(userId);
    return;
  }

  // Clear existing cart in a single operation
  await clearCart(userId);

  // Insert all items in as few round trips as possible
  // We intentionally avoid using addToCart in a loop to reduce chattiness
  const values = localCartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  try {
    await sql`
      INSERT INTO public.cart_items (user_id, product_id, quantity, selected_size)
      SELECT
        ${userId}::text,
        v.product_id::uuid,
        v.quantity::integer,
        '100ml'::text
      FROM jsonb_to_recordset(${JSON.stringify(values)}::jsonb) AS v(product_id text, quantity int)
    `;
  } catch (error) {
    console.error('Error syncing cart from local storage:', error);
    // Fallback to safer but chattier per-item add
    for (const item of localCartItems) {
      await addToCart(userId, item.productId, item.quantity);
    }
  }
}

// Validate cart items (check stock availability)
export async function validateCartItems(userId: string): Promise<{
  valid: boolean;
  issues: Array<{
    productId: string;
    productName: string;
    issue: 'out_of_stock' | 'insufficient_stock';
    availableStock: number;
    requestedQuantity: number;
  }>;
}> {
  const cartItems = await getCartItems(userId);

  if (!cartItems.length) {
    return { valid: true, issues: [] };
  }

  const issues: Array<{
    productId: string;
    productName: string;
    issue: 'out_of_stock' | 'insufficient_stock';
    availableStock: number;
    requestedQuantity: number;
  }> = [];

  // Batch fetch stock for all products in the cart to avoid N+1 queries
  const productIds = Array.from(new Set(cartItems.map(item => item.product_id)));

  const stockRows = await sql`
    SELECT id, stock
    FROM public.products
    WHERE id = ANY(${productIds}::uuid[])
  `;

  const stockById = new Map<string, number>();
  for (const row of stockRows as Array<{ id: string; stock: number }>) {
    stockById.set(row.id, row.stock);
  }

  for (const item of cartItems) {
    const stock = stockById.get(item.product_id);
    if (stock === undefined) {
      continue;
    }

    if (stock === 0) {
      issues.push({
        productId: item.product_id,
        productName: item.product_name,
        issue: 'out_of_stock',
        availableStock: 0,
        requestedQuantity: item.quantity,
      });
    } else if (stock < item.quantity) {
      issues.push({
        productId: item.product_id,
        productName: item.product_name,
        issue: 'insufficient_stock',
        availableStock: stock,
        requestedQuantity: item.quantity,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Calculate cart total with promotions
export async function calculateCartTotal(userId: string): Promise<CartTotals> {
  try {
    const result = await sql`
      SELECT * FROM public.calculate_cart_total(${userId}::text)
    `;

    if (result.length === 0) {
      return { subtotal: 0, discount: 0, total: 0, promotion_text: null };
    }

    const totals = result[0];
    return {
      subtotal: parseFloat(totals.subtotal),
      discount: parseFloat(totals.discount),
      total: parseFloat(totals.total),
      promotion_text: totals.promotion_text,
    };
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return { subtotal: 0, discount: 0, total: 0, promotion_text: null };
  }
}
