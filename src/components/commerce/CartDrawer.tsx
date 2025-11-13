"use client";
import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { removeFromCart } from '@/lib/supabase/cart';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

const SIZES = ['20ml', '50ml', '100ml'];
const SIZE_PRICES: Record<string, number> = {
  '20ml': 349,
  '50ml': 599,
  '100ml': 799
};

export function CartDrawer() {
  const { 
    items, 
    isOpen,
    isLoading,
    error,
    closeCart, 
    updateQuantity, 
    removeItem, 
    getSubtotal, 
    getTax, 
    getTotal,
    clearError,
    setItems
  } = useCartStore();

  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleSizeChange = async (productId: string, oldSize: string, newSize: string, quantity: number) => {
    const oldItemKey = `${productId}-${oldSize}`;
    const newItemKey = `${productId}-${newSize}`;
    
    // Add both old and new keys to loading state
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(oldItemKey);
      newSet.add(newItemKey);
      return newSet;
    });
    
    try {
      // Find the product
      const item = items.find(item => item.product.id === productId && item.selectedSize === oldSize);
      if (!item) {
        throw new Error('Product not found');
      }

      const user = useAuthStore.getState().user;
      
      if (user) {
        // For authenticated users, use the cart store methods which handle loading state properly
        await removeItem(productId, oldSize);
        await useCartStore.getState().addItem(item.product, quantity, newSize);
      } else {
        // For guest users, handle locally
        const newItems = items
          .filter(currentItem => !(currentItem.product.id === productId && currentItem.selectedSize === oldSize))
          .concat([{
            ...item,
            id: newItemKey,
            selectedSize: newSize
          }]);
        
        setItems(newItems);
      }
      
    } catch (error) {
      console.error('Error changing size:', error);
    } finally {
      // Clear both loading states
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(oldItemKey);
        newSet.delete(newItemKey);
        return newSet;
      });
    }
  };

  const handleQuantityChange = async (productId: string, selectedSize: string, newQuantity: number) => {
    const itemKey = `${productId}-${selectedSize}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      await updateQuantity(productId, newQuantity, selectedSize);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string, selectedSize: string) => {
    const itemKey = `${productId}-${selectedSize}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      await removeItem(productId, selectedSize);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const getItemPrice = (selectedSize: string): number => {
    return SIZE_PRICES[selectedSize] || SIZE_PRICES['100ml'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl flex flex-col border-l border-gray-200 dark:border-slate-800">
        {/* Header - Premium Design */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Shopping Cart
            </h2>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={closeCart} className="hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
            <X className="h-6 w-6 text-slate-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button 
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {isLoading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              <p className="text-slate-600 dark:text-gray-400 mb-4 font-medium mt-4">
                Loading your cart...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="mb-4">
                <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-slate-600 dark:text-gray-400 mb-4 font-medium">
                Your cart is empty
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-500 mb-6">
                Discover our premium fragrances
              </p>
              <Button 
                onClick={closeCart}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const selectedSize = item.selectedSize || '100ml';
                const itemKey = `${item.product.id}-${selectedSize}`;
                const isItemLoading = loadingItems.has(itemKey);
                const itemPrice = getItemPrice(selectedSize);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={itemKey} className="flex space-x-4 border-b border-gray-200 dark:border-slate-800 pb-4 hover:bg-gray-50 dark:hover:bg-slate-900/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <div className="relative">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                      {item.quantity > 1 && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      )}
                      {isItemLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {item.product.type}
                      </p>
                      
                      {/* Size Dropdown */}
                      <div className="flex items-center space-x-2 mt-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-gray-400">Size:</label>
                        <select
                          value={selectedSize}
                          onChange={(e) => handleSizeChange(item.product.id, selectedSize, e.target.value, item.quantity)}
                          disabled={isItemLoading}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium disabled:opacity-50 hover:border-amber-400 dark:hover:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
                        >
                          {SIZES.map(size => (
                            <option key={size} value={size}>
                              {size} - ₹{SIZE_PRICES[size]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-1 mt-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, selectedSize, item.quantity - 1)}
                          disabled={isItemLoading}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 text-slate-600 dark:text-gray-400"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, selectedSize, item.quantity + 1)}
                          disabled={isItemLoading}
                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 text-slate-600 dark:text-gray-400"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <div className="border-l border-gray-300 dark:border-slate-700 mx-1"></div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id, selectedSize)}
                          disabled={isItemLoading}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded transition-colors disabled:opacity-50"
                          title="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          ₹{itemPrice}/unit
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-800 p-6 bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 space-y-4">
            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
              {/* Calculate subtotal based on size prices */}
              {(() => {
                const subtotal = items.reduce((sum, item) => {
                  const selectedSize = item.selectedSize || '100ml';
                  const itemPrice = getItemPrice(selectedSize);
                  return sum + (itemPrice * item.quantity);
                }, 0);

                // Check for "Buy 2 Get 1 Free" promotion (2 x 100ml = 1 free)
                const count100ml = items.reduce((sum, item) => {
                  const selectedSize = item.selectedSize || '100ml';
                  return sum + (selectedSize === '100ml' ? item.quantity : 0);
                }, 0);
                
                const freeBottles = Math.floor(count100ml / 2);
                const discount = freeBottles * SIZE_PRICES['100ml'];
                const total = subtotal - discount;

                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-gray-400 font-medium">Subtotal</span>
                      <span className="text-slate-900 dark:text-white font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                        <span className="text-green-700 dark:text-green-400 font-medium">Discount (Buy 2 Get 1 Free)</span>
                        <span className="text-green-700 dark:text-green-400 font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                      <span className="text-slate-900 dark:text-white font-bold">Total</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="space-y-2">
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={closeCart}
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button 
                variant="secondary"
                asChild 
                className="w-full border-2 border-amber-400 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold py-3"
                onClick={closeCart}
              >
                <Link href="/cart">View Full Cart</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
