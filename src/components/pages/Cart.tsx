"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { getCartItems, calculateCartTotal, updateCartItemQuantity, removeFromCart } from '@/lib/supabase/cart';
import { supabase } from '@/lib/supabase/client';

interface CartItemDisplay {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_images: string[];
  quantity: number;
  selected_size: string;
  total_price: number;
}

interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  promotion_text: string | null;
}

export function Cart() {
  const { user, isInitialized } = useAuthStore();
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  const [totals, setTotals] = useState<CartTotals>({ subtotal: 0, discount: 0, total: 0, promotion_text: null });
  const [loading, setLoading] = useState(true);

  // Refresh cart data function
  const refreshCart = async (userId: string) => {
    try {
      const cartData = await getCartItems(userId);
      setCartItems(cartData);

      const totalsData = await calculateCartTotal(userId);
      setTotals(totalsData);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Load cart items from backend with real-time subscription
  useEffect(() => {
    async function loadCart() {
      // Wait for auth to finish initializing
      if (!isInitialized) {
        return;
      }

      if (!user?.id) {
        setLoading(false);
        setCartItems([]);
        setTotals({ subtotal: 0, discount: 0, total: 0, promotion_text: null });
        return;
      }

      try {
        setLoading(true);
        
        // Initial fetch
        await refreshCart(user.id);

        // Subscribe to real-time changes on cart_items table
        const subscription = supabase
          .channel(`cart-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cart_items',
              filter: `user_id=eq.${user.id}`,
            },
            (payload: any) => {
              console.log('Cart changed:', payload);
              refreshCart(user.id);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    }

    const cleanup = loadCart();

    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(fn => fn?.());
      }
    };
  }, [user?.id, isInitialized]);

  const handleQuantityChange = async (productId: string, selectedSize: string, newQuantity: number) => {
    if (!user?.id) return;

    try {
      if (newQuantity <= 0) {
        await removeFromCart(user.id, productId, selectedSize);
      } else {
        await updateCartItemQuantity(user.id, productId, newQuantity, selectedSize);
      }
      
      // Reload cart data
      await refreshCart(user.id);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async (productId: string, selectedSize: string) => {
    if (!user?.id) return;

    try {
      await removeFromCart(user.id, productId, selectedSize);
      
      // Reload cart data
      await refreshCart(user.id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 md:py-16 px-2 md:px-4 flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-4 border-amber-200 border-t-amber-500 mx-auto mb-6"></div>
          <p className="text-slate-600 dark:text-gray-300 text-base md:text-lg font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-8 md:py-16 px-2 md:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-block bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 p-8 md:p-12 rounded-full border-2 border-amber-200/50 dark:border-amber-700/50 shadow-2xl">
              <ShoppingBag className="h-16 md:h-20 w-16 md:w-20 text-amber-600 dark:text-amber-400 mx-auto opacity-90" />
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-white dark:via-amber-200 dark:to-orange-200 bg-clip-text text-transparent mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 md:mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
              Discover our curated collection of luxury fragrances and find your signature scent
            </p>
          </div>
          <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
            <Button size="lg" asChild className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4">
              <Link href="/collections/men">
                Shop Men's Collection
              </Link>
            </Button>
            <Button size="lg" asChild variant="secondary" className="border-2 border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4">
              <Link href="/collections/women">
                Shop Women's Collection
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-amber-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-4 md:py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Enhanced Design */}
        <div className="mb-6 md:mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/collections/men" className="md:hidden">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                <ArrowLeft className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs md:text-sm font-bold tracking-widest uppercase px-3 md:px-4 py-1 md:py-2 rounded-full shadow-lg">
                Shopping
              </span>
            </div>
          </div>
          <div className="relative">
            <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 dark:from-white dark:via-amber-200 dark:to-orange-200 bg-clip-text text-transparent mt-2 mb-3">
              Your Cart
            </h1>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-20"></div>
          </div>
          <p className="text-slate-600 dark:text-gray-300 mt-2 md:mt-3 text-base md:text-xl font-medium">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your luxury collection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cartItems.map(item => (
              <div 
                key={`${item.product_id}-${item.selected_size}`}
                className="bg-white dark:bg-slate-900 rounded-lg md:rounded-xl p-3 md:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-3 md:gap-6">
                  {/* Product Image */}
                  <div className="shrink-0 self-center sm:self-start">
                    <img
                      src={item.product_images && item.product_images.length > 0
                        ? item.product_images[0]
                        : '/perfume-logo.png'
                      }
                      alt={item.product_name}
                      className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
                      onError={(e) => {
                        e.currentTarget.src = '/perfume-logo.png';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product_id}`} className="block mb-2 md:mb-3 group">
                      <h3 className="font-bold text-base md:text-xl text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                        {item.product_name}
                      </h3>
                    </Link>

                    {/* Size Badge & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <span className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 text-xs md:text-sm font-bold px-2 md:px-4 py-1 md:py-2 rounded-full border border-amber-200 dark:border-amber-800 w-fit">
                        Size: {item.selected_size}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm md:text-lg">
                        {formatPrice(item.product_price)}
                      </span>
                    </div>

                    {/* Quantity Controls & Price - Mobile Stack */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-gray-300">
                          Qty:
                        </span>
                        <div className="flex items-center border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.selected_size, item.quantity - 1)}
                            className="px-2 md:px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-slate-900 dark:text-white text-sm md:text-base"
                          >
                            −
                          </button>
                          <span className="px-3 md:px-6 py-2 min-w-[3rem] md:min-w-[4rem] text-center font-bold text-slate-900 dark:text-white text-sm md:text-base border-l border-r border-slate-300 dark:border-slate-700">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.selected_size, item.quantity + 1)}
                            className="px-2 md:px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-slate-900 dark:text-white text-sm md:text-base"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6">
                        <div className="text-right">
                          <p className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white">
                            {formatPrice(item.total_price)}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                            {formatPrice(item.product_price)} × {item.quantity}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.product_id, item.selected_size)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-lg p-2 md:p-3"
                          title="Remove item from cart"
                        >
                          <Trash2 className="h-4 w-4 md:h-6 md:w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Mobile Responsive */}
          <div className="lg:col-span-1 mt-4 lg:mt-0">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 md:p-7 border-2 border-amber-200 dark:border-amber-900/30 lg:sticky lg:top-8 shadow-xl">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mb-4 md:mb-8 flex items-center">
                <span className="text-lg md:text-2xl mr-2 md:mr-3">💳</span>
                Order Summary
              </h2>

              <div className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b-2 border-slate-300 dark:border-slate-700">
                <div className="flex justify-between text-sm md:text-base text-slate-700 dark:text-gray-300 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(totals.subtotal)}</span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 p-2 md:p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sm md:text-base">
                    <span>Discount</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}

                {totals.promotion_text && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-300 dark:border-emerald-800 rounded-lg p-2 md:p-3 text-xs md:text-sm">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center">
                      <span className="text-sm md:text-lg mr-1 md:mr-2">✨</span>{totals.promotion_text}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 md:mt-6 mb-6 md:mb-8 p-3 md:p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <span className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                  {formatPrice(totals.total)}
                </span>
              </div>

              <div className="space-y-2 md:space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 md:py-4 text-sm md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>

                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full border-2 border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-bold py-3 md:py-4 text-sm md:text-lg"
                  asChild
                >
                  <Link href="/collections/men">
                    Continue Shopping
                  </Link>
                </Button>
              </div>

              {/* Extra Info - Mobile Responsive */}
              <div className="mt-6 md:mt-8 space-y-2 md:space-y-3 text-xs md:text-sm font-medium">
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-sm md:text-lg">🚚</span>
                  <span className="text-slate-700 dark:text-gray-300">Free shipping on orders above ₹5000</span>
                </div>
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-sm md:text-lg">✅</span>
                  <span className="text-slate-700 dark:text-gray-300">100% Authentic Guarantee</span>
                </div>
                <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-sm md:text-lg">↩️</span>
                  <span className="text-slate-700 dark:text-gray-300">30-day Return Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
