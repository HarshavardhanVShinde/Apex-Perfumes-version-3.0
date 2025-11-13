import { supabase } from './client'
import type { Database } from '@/types/supabase'

type CartItem = Database['public']['Views']['cart_items_view']['Row']

export interface CartItemWithProduct {
  id: string
  user_id: string
  product_id: string
  quantity: number
  selected_size: string
  product_name: string
  product_price: number
  product_images: string[]
  total_price: number
}

// Ensure user profile exists
export async function ensureUserProfile(userId: string, userMetadata?: { full_name?: string }) {
  try {
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.warn('Error checking profile:', selectError);
    }

    if (!existingProfile) {
      console.log('Profile not found, creating profile for user:', userId);
      
      // Extract name from metadata or default
      const fullName = userMetadata?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
        });

      if (insertError) {
        console.warn('Profile creation failed:', insertError);
        // Don't throw error, continue without profile
      } else {
        console.log('Profile created successfully for user:', userId);
      }
    }
  } catch (error) {
    console.warn('Error ensuring profile:', error);
    // Don't throw - allow cart operations to continue
  }
}

// Get user's cart items
export async function getCartItems(userId: string): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from('cart_items_view')
    .select('*')
    .eq('user_id', userId)
    .order('id')

  if (error) {
    throw error
  }

  return (data || []).map(item => ({
    id: item.id || '',
    user_id: item.user_id || '',
    product_id: item.product_id || '',
    quantity: item.quantity || 0,
    selected_size: item.selected_size || '100ml',
    product_name: item.product_name || '',
    product_price: item.product_price || 0,
    product_images: item.product_images || [],
    total_price: item.total_price || 0
  }))
}

// Add item to cart or update quantity if exists (with size support)
export async function addToCart(
  userId: string, 
  productId: string, 
  quantity: number = 1,
  selectedSize: string = '100ml'
): Promise<boolean> {
  try {
    console.log('🛒 Adding to cart:', { userId, productId, quantity, selectedSize });
    
    // Ensure user profile exists first
    const { data: { user } } = await supabase.auth.getUser();
    await ensureUserProfile(userId, user?.user_metadata);
    
    // First check if the item already exists
    const { data: existingItem, error: selectError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('selected_size', selectedSize)
      .maybeSingle();

    if (selectError) {
      console.error('❌ Error checking existing cart item:', selectError);
      throw selectError;
    }

    if (existingItem) {
      // Update existing item directly
      const newQuantity = existingItem.quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('❌ Error updating cart item:', updateError);
        throw updateError;
      }
    } else {
      // Insert new item directly
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
          selected_size: selectedSize
        });

      if (insertError) {
        console.error('❌ Error inserting cart item:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Successfully added to cart');
    return true;
  } catch (error) {
    console.error('❌ Error in addToCart:', error);
    throw error;
  }
}

// Remove item from cart (with size support)
export interface RemoveCartItemOptions {
  userId: string;
  cartItemId?: string;
  productId?: string;
  selectedSize?: string | null;
}

export async function removeFromCart(options: RemoveCartItemOptions): Promise<boolean> {
  const { userId, cartItemId, productId, selectedSize } = options;

  let query = supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (cartItemId) {
    query = query.eq('id', cartItemId);
  } else if (productId) {
    query = query.eq('product_id', productId);
    if (selectedSize !== undefined) {
      if (selectedSize === null) {
        query = query.is('selected_size', null);
      } else {
        query = query.or(`selected_size.eq.${selectedSize},selected_size.is.null`);
      }
    }
  } else {
    throw new Error('removeFromCart requires a cartItemId or productId.');
  }

  const { error } = await query;

  if (error) {
    throw error;
  }

  return true;
}

// Update item quantity in cart (with size support)
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
    await removeFromCart({ userId, cartItemId, productId, selectedSize });
    return true;
  }

  let query = supabase
    .from('cart_items')
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (cartItemId) {
    query = query.eq('id', cartItemId);
  } else if (productId) {
    query = query.eq('product_id', productId);
    if (selectedSize !== undefined) {
      if (selectedSize === null) {
        query = query.is('selected_size', null);
      } else {
        query = query.eq('selected_size', selectedSize);
      }
    }
  } else {
    throw new Error('updateCartItemQuantity requires a cartItemId or productId.');
  }

  const { error } = await query;

  if (error) {
    throw error;
  }

  return true;
}

// Clear entire cart
export async function clearCart(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return true;
}

// Get cart summary (total items and total price)
export async function getCartSummary(userId: string): Promise<{
  totalItems: number
  totalPrice: number
  itemCount: number
}> {
  const cartItems = await getCartItems(userId)
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total_price, 0)
  const itemCount = cartItems.length

  return {
    totalItems,
    totalPrice,
    itemCount
  }
}

// Check if product is in cart
export async function isProductInCart(userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return !!data
}

// Get cart item quantity for a specific product
export async function getCartItemQuantity(userId: string, productId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data?.quantity || 0
}

// Sync cart with local storage (for guest users)
export async function syncCartFromLocalStorage(userId: string, localCartItems: Array<{
  productId: string
  quantity: number
}>): Promise<void> {
  // Clear existing cart first
  await clearCart(userId)

  // Add items from local storage
  for (const item of localCartItems) {
    await addToCart(userId, item.productId, item.quantity)
  }
}

// Validate cart items (check stock availability)
export async function validateCartItems(userId: string): Promise<{
  valid: boolean
  issues: Array<{
    productId: string
    productName: string
    issue: 'out_of_stock' | 'insufficient_stock'
    availableStock: number
    requestedQuantity: number
  }>
}> {
  const cartItems = await getCartItems(userId)
  const issues: Array<{
    productId: string
    productName: string
    issue: 'out_of_stock' | 'insufficient_stock'
    availableStock: number
    requestedQuantity: number
  }> = []

  for (const item of cartItems) {
    // Get current product stock
    const { data: product, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()

    if (error) continue

    if (product.stock === 0) {
      issues.push({
        productId: item.product_id,
        productName: item.product_name,
        issue: 'out_of_stock',
        availableStock: 0,
        requestedQuantity: item.quantity
      })
    } else if (product.stock < item.quantity) {
      issues.push({
        productId: item.product_id,
        productName: item.product_name,
        issue: 'insufficient_stock',
        availableStock: product.stock,
        requestedQuantity: item.quantity
      })
    }
  }

  return {
    valid: issues.length === 0,
    issues
  }
}

// Calculate cart total with promotions
export interface CartTotals {
  subtotal: number
  discount: number
  total: number
  promotion_text: string | null
}

export async function calculateCartTotal(userId: string): Promise<CartTotals> {
  try {
    const { data, error } = await supabase.rpc('calculate_cart_total' as any, {
      p_user_id: userId
    })

    if (error) {
      console.error('Error calculating cart total:', error)
      return { subtotal: 0, discount: 0, total: 0, promotion_text: null }
    }

    return (data && data[0]) || { subtotal: 0, discount: 0, total: 0, promotion_text: null }
  } catch (error) {
    console.error('Error calculating cart total:', error)
    return { subtotal: 0, discount: 0, total: 0, promotion_text: null }
  }
}
