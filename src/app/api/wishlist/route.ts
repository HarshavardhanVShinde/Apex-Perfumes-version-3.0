import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  isProductInWishlist,
  clearWishlist,
} from '@/lib/neon/wishlist';
import { ensureUserProfile } from '@/lib/neon/cart';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user profile exists in Neon
    await ensureUserProfile(user.id, { 
      email: user.primaryEmail || undefined,
      displayName: user.displayName || undefined 
    });

    const items = await getWishlistItems(user.id);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user profile exists in Neon
    await ensureUserProfile(user.id, { 
      email: user.primaryEmail || undefined,
      displayName: user.displayName || undefined 
    });

    const body = await request.json();
    const { action, productId } = body;

    switch (action) {
      case 'add':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
          );
        }
        await addToWishlist(user.id, productId);
        return NextResponse.json({ success: true });

      case 'remove':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
          );
        }
        await removeFromWishlist(user.id, productId);
        return NextResponse.json({ success: true });

      case 'check':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
          );
        }
        const inWishlist = await isProductInWishlist(user.id, productId);
        return NextResponse.json({ inWishlist });

      case 'clear':
        await clearWishlist(user.id);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
