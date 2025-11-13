import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getProductWithFallback, enhanceCartItemsWithProductData } from '@/lib/supabase/products-sync';

// Helper function to get price by size
function getSizePrice(selectedSize: string): number {
  const sizePrices: Record<string, number> = {
    '20ml': 349,
    '50ml': 599,
    '100ml': 799
  };
  return sizePrices[selectedSize] || sizePrices['100ml'];
}

export async function GET(request: NextRequest) {
  try {
    // Debug: Check authentication
    console.log('🔍 Cart API: Starting authentication check...');
    
    // Get session first
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('🔍 Cart API: Session result:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id
    });

    if (sessionError) {
      console.error('❌ Cart API: Session error:', sessionError);
      return NextResponse.json(
        {
          error: 'Session error',
          details: sessionError.message,
          authenticated: false
        },
        { status: 401 }
      );
    }

    if (!session?.user) {
      console.log('❌ Cart API: No session found');
      return NextResponse.json(
        {
          error: 'User not authenticated',
          authenticated: false,
          message: 'Please login to view your cart'
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Cart API: User authenticated:', session.user.id);

    // Get cart items directly from the cart_items table
    const { data: cartItems, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        selected_size
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching cart items:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      );
    }

    // Enhance cart items with complete product data including images
    const enhancedItems = await enhanceCartItemsWithProductData(cartItems || []);

    // Transform the response and calculate prices
    const transformedItems = enhancedItems.map((item: any) => {
      const selectedSize = item.selected_size || '100ml';
      const price = getSizePrice(selectedSize);
      
      return {
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: price,
        quantity: item.quantity,
        selected_size: selectedSize,
        product_images: item.product_images || [],
        total_price: price * item.quantity,
      };
    });

    // Calculate cart totals with promotion
    const subtotal = transformedItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Count 100ml bottles for promotion
    const count100ml = transformedItems
      .filter(item => item.selected_size === '100ml')
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const freeBottles = Math.floor(count100ml / 2);
    const discount = freeBottles * 799; // 100ml price is 799
    const total = subtotal - discount;

    return NextResponse.json({
      items: transformedItems,
      summary: {
        subtotal,
        discount,
        total,
        promotion_text: discount > 0 ? 'Buy 2 Get 1 Free on 100ml bottles' : null,
      },
    });
  } catch (error) {
    console.error('Cart API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session first for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, productId, quantity, selectedSize = '100ml' } = body;

    if (!action || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let error;

    switch (action) {
      case 'add':
        if (!quantity || quantity < 1) {
          return NextResponse.json(
            { error: 'Invalid quantity' },
            { status: 400 }
          );
        }
        ({ error } = await supabase.rpc('upsert_cart_item_with_size', {
          p_user_id: session.user.id,
          p_product_id: productId,
          p_quantity: quantity,
          p_selected_size: selectedSize,
        }));
        break;

      case 'update':
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          ({ error } = await supabase.rpc('remove_cart_item_with_size', {
            p_user_id: session.user.id,
            p_product_id: productId,
            p_selected_size: selectedSize,
          }));
        } else {
          ({ error } = await supabase.rpc('set_cart_item_quantity_with_size', {
            p_user_id: session.user.id,
            p_product_id: productId,
            p_quantity: quantity,
            p_selected_size: selectedSize,
          }));
        }
        break;

      case 'remove':
        ({ error } = await supabase.rpc('remove_cart_item_with_size', {
          p_user_id: session.user.id,
          p_product_id: productId,
          p_selected_size: selectedSize,
        }));
        break;

      case 'clear':
        ({ error } = await supabase.rpc('clear_cart', {
          p_user_id: session.user.id,
        }));
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (error) {
      console.error('Error updating cart:', error);
      return NextResponse.json(
        { error: 'Failed to update cart' },
        { status: 500 }
      );
    }

    // Get updated cart items
    const { data: cartItems, error: fetchError } = await supabase
      .from('cart_items')
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        selected_size
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching updated cart items:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated cart items' },
        { status: 500 }
      );
    }

    // Enhance cart items with complete product data including images
    const enhancedItems = await enhanceCartItemsWithProductData(cartItems || []);

    // Transform the response and calculate prices
    const transformedItems = enhancedItems.map((item: any) => {
      const selectedSize = item.selected_size || '100ml';
      const price = getSizePrice(selectedSize);
      
      return {
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: price,
        quantity: item.quantity,
        selected_size: selectedSize,
        product_images: item.product_images || [],
        total_price: price * item.quantity,
      };
    });

    // Calculate updated totals
    const subtotal = transformedItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Count 100ml bottles for promotion
    const count100ml = transformedItems
      .filter(item => item.selected_size === '100ml')
      .reduce((sum, item) => sum + item.quantity, 0);
    
    const freeBottles = Math.floor(count100ml / 2);
    const discount = freeBottles * 799; // 100ml price is 799
    const total = subtotal - discount;

    return NextResponse.json({
      items: transformedItems,
      summary: {
        subtotal,
        discount,
        total,
        promotion_text: discount > 0 ? 'Buy 2 Get 1 Free on 100ml bottles' : null,
      },
    });
  } catch (error) {
    console.error('Cart API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
