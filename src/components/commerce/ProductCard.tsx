import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatRating } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getMinPrice = () => {
    if (product.sizes) {
      const prices = Object.values(product.sizes)
        .map((s: any) => s?.price)
        .filter((p: any) => typeof p === 'number');
      if (prices.length > 0) return Math.min(...prices);
    }
    return product.price;
  };

  const getImageForIndex = (index: number) => {
    const image = product.images[index] ?? product.images[0];
    return image ?? '/perfume-logo.png';
  };

  // Update wishlist state when store changes
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product);
      // console.log('✅ Added to cart:', product.name);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      // Could add a toast notification here for user feedback
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const success = await toggleItem(product);
      if (success) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleMouseEnter = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <Link 
      href={`/product/${product.id}`}
      className="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:scale-[1.02]"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Image
          src={getImageForIndex(currentImageIndex)}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {product.isNew && <Badge variant="accent" size="sm">New</Badge>}
          {product.isBestSeller && <Badge variant="success" size="sm">Best Seller</Badge>}
          {product.isOnSale && <Badge variant="danger" size="sm">Sale</Badge>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2.5 sm:p-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform duration-200 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
        >
          <Heart 
            className={`h-5 w-5 sm:h-4 sm:w-4 transition-colors ${
              isWishlisted 
                ? 'fill-red-500 text-red-500' 
                : 'text-slate-600 dark:text-gray-400'
            }`} 
          />
        </button>

        {/* Quick add to cart */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg min-h-[44px] sm:min-h-[36px] font-semibold"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Brand & Type */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-gray-400 mb-1.5 sm:mb-1">
          <span className="font-medium">{product.brand}</span>
          <span className="text-amber-600 dark:text-amber-400">{product.type}</span>
        </div>

        {/* Product name */}
        <h3 className="font-semibold text-base sm:text-base text-slate-900 dark:text-white mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2.5 sm:mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="ml-1.5 text-sm font-medium text-slate-700 dark:text-gray-300">
              {formatRating(product.rating)}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-bold text-lg sm:text-base text-slate-900 dark:text-white">
            From {formatPrice(getMinPrice())}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-500 dark:text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Top notes preview */}
        <div className="mt-2">
          <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-1">
            {product.notes.top.slice(0, 2).join(', ')}
            {product.notes.top.length > 2 && '...'}
          </p>
        </div>
      </div>
    </Link>
  );
}
