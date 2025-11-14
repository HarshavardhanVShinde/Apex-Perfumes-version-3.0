import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import { getCartItems, addToCart, updateCartItemQuantity, removeFromCart, clearCart, ensureUserProfile } from '@/lib/neon/cart';
import { getProduct } from '@/lib/neon/products';

// Helper function to get price by size (fallbacks)
function getSizePrice(selectedSize: string): number {
  const sizePrices: Record<string, number> = {
    '20ml': 349,
    '50ml': 499,
    '100ml': 699,
  };
  return sizePrices[selectedSize] || sizePrices['100ml'];
}

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not authenticated',
          authenticated: false,
          message: 'Please login to view your cart'
        },
        { status: 401 }
      );
    }

    // Ensure user profile exists
    await ensureUserProfile(user.id, {
      displayName: user.displayName || '',
      email: user.primaryEmail || '',
    });

    // Get cart items from Neon
    const cartItems = await getCartItems(user.id);

    // Transform the response
    const transformedItems = cartItems.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      selected_size: item.selected_size,
      product_images: item.product_images,
      total_price: item.total_price,
    }));

    // Calculate cart totals with promotions + optional coupon
    const subtotal = transformedItems.reduce((sum, item) => sum + item.total_price, 0);

    // Promotion: Buy 2 Get 1 Free (100ml)
    const count100ml = transformedItems
      .filter(item => item.selected_size === '100ml')
      .reduce((sum, item) => sum + item.quantity, 0);
    const freeBottles = Math.floor(count100ml / 2);
    const promoDiscount = freeBottles * 699; // 100ml price fallback is 699

    // Coupon handling (AURA10: 10% OFF on totals >= 1199)
    const coupon = request.nextUrl.searchParams.get('coupon')?.toUpperCase() || '';
    const threshold = 1199;
    const beforeCoupon = Math.max(0, subtotal - promoDiscount);
    const couponDiscount = coupon === 'AURA10' && beforeCoupon >= threshold
      ? Math.round(beforeCoupon * 0.10)
      : 0;
    const total = Math.max(0, beforeCoupon - couponDiscount);

    const promoParts: string[] = [];
    if (promoDiscount > 0) promoParts.push('Buy 2 Get 1 Free (100ml)');
    if (couponDiscount > 0) promoParts.push('AURA10: 10% OFF');

    return NextResponse.json({
      items: transformedItems,
      summary: {
        subtotal,
        discount: promoDiscount + couponDiscount,
        total,
        promotion_text: promoParts.length ? promoParts.join(' + ') : null,
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
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure user profile exists
    await ensureUserProfile(user.id, {
      displayName: user.displayName || '',
      email: user.primaryEmail || '',
    });

    const body = await request.json();
    const { action, productId, quantity, selectedSize = '100ml' } = body;

    if (!action || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'add':
        if (!quantity || quantity < 1) {
          return NextResponse.json(
            { error: 'Invalid quantity' },
            { status: 400 }
          );
        }
        await addToCart(user.id, productId, quantity, selectedSize);
        break;

      case 'update':
        if (quantity <= 0) {
          await removeFromCart({ userId: user.id, productId, selectedSize });
        } else {
          await updateCartItemQuantity({ userId: user.id, productId, quantity, selectedSize });
        }
        break;

      case 'remove':
        await removeFromCart({ userId: user.id, productId, selectedSize });
        break;

      case 'clear':
        await clearCart(user.id);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Get updated cart items
    const cartItems = await getCartItems(user.id);

    // Transform the response
    const transformedItems = cartItems.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      selected_size: item.selected_size,
      product_images: item.product_images,
      total_price: item.total_price,
    }));

    // Calculate updated totals (promotions + coupon)
    const subtotal = transformedItems.reduce((sum, item) => sum + item.total_price, 0);

    const count100ml = transformedItems
      .filter(item => item.selected_size === '100ml')
      .reduce((sum, item) => sum + item.quantity, 0);
    const freeBottles = Math.floor(count100ml / 2);
    const promoDiscount = freeBottles * 699; // 100ml price fallback is 699

    const url = new URL(request.url);
    const coupon = url.searchParams.get('coupon')?.toUpperCase() || '';
    const threshold = 1199;
    const beforeCoupon = Math.max(0, subtotal - promoDiscount);
    const couponDiscount = coupon === 'AURA10' && beforeCoupon >= threshold
      ? Math.round(beforeCoupon * 0.10)
      : 0;
    const total = Math.max(0, beforeCoupon - couponDiscount);

    const promoParts: string[] = [];
    if (promoDiscount > 0) promoParts.push('Buy 2 Get 1 Free (100ml)');
    if (couponDiscount > 0) promoParts.push('AURA10: 10% OFF');

    return NextResponse.json({
      items: transformedItems,
      summary: {
        subtotal,
        discount: promoDiscount + couponDiscount,
        total,
        promotion_text: promoParts.length ? promoParts.join(' + ') : null,
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
