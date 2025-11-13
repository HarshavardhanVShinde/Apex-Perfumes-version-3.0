import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
      console.log('✅ Added to cart:', product.name);
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
      className="group block bg-white dark:bg-primary-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getImageForIndex(currentImageIndex)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onError={(event) => {
            event.currentTarget.src = '/perfume-logo.png';
          }}
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
          className="absolute top-3 right-3 p-2 bg-white dark:bg-primary-800 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isWishlisted 
                ? 'fill-red-500 text-red-500' 
                : 'text-primary-600 dark:text-neutral-400'
            }`} 
          />
        </button>

        {/* Quick add to cart */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Brand & Type */}
        <div className="flex items-center justify-between text-sm text-primary-600 dark:text-neutral-400 mb-1">
          <span>{product.brand}</span>
          <span>{product.type}</span>
        </div>

        {/* Product name */}
        <h3 className="font-medium text-primary-900 dark:text-neutral-100 mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm text-primary-600 dark:text-neutral-400">
              {formatRating(product.rating)}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-primary-900 dark:text-neutral-100">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-primary-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Top notes preview */}
        <div className="mt-2">
          <p className="text-xs text-primary-600 dark:text-neutral-400">
            {product.notes.top.slice(0, 2).join(', ')}
            {product.notes.top.length > 2 && '...'}
          </p>
        </div>
      </div>
    </Link>
  );
}
