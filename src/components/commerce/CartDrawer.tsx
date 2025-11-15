"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { CartItem as CartItemType } from '@/types';
import Image from 'next/image';

const DEFAULT_SIZES = ['20ml', '50ml', '100ml'];

export function CartDrawer() {
  const {
    items,
    totals,
    isOpen,
    isLoading,
    error,
    closeCart,
    updateQuantity,
    removeItem,
    addItem,
    clearError,
    applyCoupon,
    clearCoupon,
  } = useCartStore();

  const router = useRouter();
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const drawerRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeCart();
      }
    }

    // Add small delay to avoid immediate close when opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeCart]);

  const buildLoadingKey = (cartItemId: string, size: string | null) => `${cartItemId}-${size ?? 'default'}`;

  const handleSizeChange = async (item: CartItemType, newSize: string) => {
    const oldSizeValue = item.selectedSize ?? null;
    const oldDisplaySize = oldSizeValue ?? '20ml';
    if (newSize === oldDisplaySize) return;

    const oldItemKey = buildLoadingKey(item.id, oldSizeValue);
    const newItemKey = `${item.product.id}-${newSize}`;

    setLoadingItems(prev => {
      const next = new Set(prev);
      next.add(oldItemKey);
      next.add(newItemKey);
      return next;
    });

    try {
      await addItem(item.product, item.quantity, newSize, { skipReload: true });
      await removeItem(item.id, item.product.id, oldSizeValue, { skipReload: true });
      await useCartStore.getState().loadCart();
    } catch (error) {
      console.error('Error changing size:', error);
      await useCartStore.getState().loadCart();
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(oldItemKey);
        next.delete(newItemKey);
        return next;
      });
    }
  };

  const handleQuantityChange = async (item: CartItemType, newQuantity: number) => {
    if (newQuantity === item.quantity) return;
    const sizeValue = item.selectedSize ?? null;
    const itemKey = buildLoadingKey(item.id, sizeValue);
    setLoadingItems(prev => new Set(prev).add(itemKey));

    try {
      await updateQuantity(item.id, item.product.id, newQuantity, item.selectedSize ?? null);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (item: CartItemType) => {
    const sizeValue = item.selectedSize ?? null;
    const itemKey = buildLoadingKey(item.id, sizeValue);
    setLoadingItems(prev => new Set(prev).add(itemKey));

    try {
      await removeItem(item.id, item.product.id, sizeValue);
    } catch (error) {
      console.error('Error removing cart item:', error);
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }
  };

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in-right"
      >
        {/* Header - Premium Design */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 via-amber-50/30 to-slate-50 dark:from-slate-900 dark:via-amber-900/10 dark:to-slate-900">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-amber-600 dark:from-white dark:to-amber-400 bg-clip-text text-transparent">
              Shopping Cart
            </h2>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              {items.reduce((t, i) => t + i.quantity, 0)} {items.reduce((t, i) => t + i.quantity, 0) === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={closeCart} 
            className="hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-all duration-300"
          >
            <X className="h-6 w-6 text-slate-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-slate-950">
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                <button 
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {isLoading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent"></div>
              <p className="text-slate-600 dark:text-gray-400 mb-4 font-medium mt-6">
                Loading your cart...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center h-full">
              <div className="mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-8 rounded-full">
                <ShoppingBag className="h-20 w-20 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-slate-900 dark:text-white mb-2 font-bold text-xl">
                Your cart is empty
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-500 mb-8">
                Discover our premium fragrances
              </p>
              <Button 
                onClick={closeCart}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const sizeValue = item.selectedSize ?? null;
                const selectedSize = sizeValue ?? '20ml';
                const itemKey = buildLoadingKey(item.id, sizeValue);
                const isItemLoading = loadingItems.has(itemKey);
                const unitPrice = item.unitPrice ?? item.product.price;
                const lineTotal = item.lineTotal ?? unitPrice * item.quantity;
                const sizeOptions = item.product.sizes ? Object.keys(item.product.sizes) : DEFAULT_SIZES;
                const coverImage = item.product.images[0] ?? '/perfume-logo.png';

                return (
                  <div key={itemKey} className="flex space-x-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 -mx-2 px-2 py-1.5 rounded-lg transition-all duration-300 group">
                    <div className="relative">
                      <Image
                        src={coverImage}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700"
                      />
                      {item.quantity > 1 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </div>
                      )}
                      {isItemLoading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {item.product.type}
                      </p>
                      
                      {/* Size and Quantity on one line */}
                      <div className="flex items-center gap-2 mt-1.5">
                        {/* Size Dropdown */}
                        <select
                          value={selectedSize}
                          onChange={(e) => handleSizeChange(item, e.target.value)}
                          disabled={isItemLoading}
                          className="px-1.5 py-0.5 text-[10px] border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold disabled:opacity-50 hover:border-amber-400 dark:hover:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all flex-1 min-w-0"
                        >
                          {sizeOptions.map(size => {
                            const priceForSize = item.product.sizes?.[size]?.price;
                            const label = priceForSize !== undefined
                              ? `${size}`
                              : size;
                            return (
                              <option key={size} value={size}>
                                {label}
                              </option>
                            );
                          })}
                        </select>

                        {/* Quantity controls - compact */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 gap-0.5">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            disabled={isItemLoading}
                            className="p-0.5 hover:bg-white dark:hover:bg-slate-700 rounded transition-all disabled:opacity-50 text-slate-700 dark:text-gray-300"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            disabled={isItemLoading}
                            className="p-0.5 hover:bg-white dark:hover:bg-slate-700 rounded transition-all disabled:opacity-50 text-slate-700 dark:text-gray-300"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={isItemLoading}
                          className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded transition-all disabled:opacity-50"
                          title="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col justify-start">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {formatPrice(lineTotal)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-500">
                        {formatPrice(unitPrice)} ea
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-t from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 space-y-3 shadow-2xl">
            {/* Coupon Section */}
            <CouponSelector
              subtotal={totals.subtotal}
              discount={totals.discount}
              promotionText={totals.promotionText}
              onApply={async (code) => applyCoupon(code)}
              onClear={async () => clearCoupon()}
            />

            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-900 dark:text-white font-bold text-base">Total</span>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">{formatPrice(totals.total)}</span>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-600 dark:text-gray-400 space-y-0.5">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
                {totals.discount > 0 && <div className="flex justify-between"><span>Discounts</span><span className="text-green-600 dark:text-green-400">-{formatPrice(totals.discount)}</span></div>}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2 text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                onClick={() => {
                  // Close the drawer first so the close animation can play,
                  // then navigate to the checkout page after a short delay.
                  closeCart();
                  setTimeout(() => router.push('/checkout'), 250);
                }}
              >
                Proceed to Checkout
              </Button>
              <Button 
                type="button"
                variant="secondary"
                className="w-full border border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold py-1.5 text-xs transition-all duration-300"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface Coupon {
  code: string;
  title: string;
  description: string;
  discount: string;
  minOrder: number;
  color: string;
}

const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'AURA10',
    title: '10% OFF',
    description: 'Get 10% discount on orders above ₹1,199',
    discount: '10% OFF',
    minOrder: 1199,
    color: 'amber',
  },
];

function CouponSelector({
  subtotal,
  discount,
  promotionText,
  onApply,
  onClear,
}: {
  subtotal: number;
  discount: number;
  promotionText: string | null;
  onApply: (code: string) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [showModal, setShowModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const handleApplyCoupon = async (code: string) => {
    await onApply(code);
    setAppliedCoupon(code);
    setShowModal(false);
  };

  const handleRemoveCoupon = async () => {
    await onClear();
    setAppliedCoupon(null);
  };

  const activeCoupon = AVAILABLE_COUPONS.find(c => c.code === appliedCoupon);

  return (
    <>
      {/* Coupon Button/Display */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-dashed border-amber-400 dark:border-amber-600 shadow-sm">
        {!activeCoupon ? (
          <button
            onClick={() => setShowModal(true)}
            className="w-full p-3 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Apply Coupon</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        ) : (
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-400">{activeCoupon.code} Applied</p>
                <p className="text-xs text-slate-600 dark:text-gray-400">{activeCoupon.title} • Saved {formatPrice(discount)}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Coupon Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Available Coupons</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Coupons List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {AVAILABLE_COUPONS.map((coupon) => {
                const eligible = subtotal >= coupon.minOrder;
                const missing = Math.max(0, coupon.minOrder - subtotal);

                return (
                  <div
                    key={coupon.code}
                    className={`p-4 rounded-xl border-2 ${
                      eligible
                        ? 'border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                    } transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className={`h-4 w-4 ${
                            eligible ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                          }`} />
                          <span className={`font-bold text-sm ${
                            eligible ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'
                          }`}>
                            {coupon.code}
                          </span>
                        </div>
                        <p className={`text-lg font-bold mb-1 ${
                          eligible ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-gray-500'
                        }`}>
                          {coupon.discount}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-gray-400 mb-2">
                          {coupon.description}
                        </p>
                        {!eligible && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                            Add {formatPrice(missing)} more to unlock
                          </p>
                        )}
                        {eligible && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                            ✓ Eligible to apply
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={!eligible}
                        className={`${
                          eligible
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                        } px-4 py-2 text-xs font-bold`}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
