"use client";
import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart';

export function CartImageTest() {
  const { items, loadCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handleTestLoad = async () => {
    setLoading(true);
    try {
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border">
      <h3 className="text-lg font-bold mb-4">Cart Image Debug Test</h3>
      <button
        onClick={handleTestLoad}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test Cart Load'}
      </button>
      
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Cart Items ({items.length}):</h4>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  console.error('Image failed to load:', item.product.images[0]);
                  e.currentTarget.src = '/perfume-logo.png';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', item.product.images[0]);
                }}
              />
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  Images: {item.product.images.length} - {item.product.images[0]}
                </p>
                <p className="text-xs text-blue-600">ID: {item.product.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}