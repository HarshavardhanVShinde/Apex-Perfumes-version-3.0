"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronRight, Sparkles, Flame, Award } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/commerce/ProductCard';
import { formatPrice, formatRating } from '@/lib/utils';
import { getProduct, getProducts } from '@/lib/supabase/products';
import { mapProductRowToProduct } from '@/lib/supabase/mappers';
import type { Database } from '@/types/supabase';
import type { Product as AppProduct } from '@/types';

type SupabaseProduct = Database['public']['Tables']['products']['Row'];

export function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<AppProduct[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('100ml');
  const [currentPrice, setCurrentPrice] = useState<number>(799);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  // Fetch product and related products from Supabase
  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the product
        const productData = await getProduct(id);
        
        if (!productData) {
          setError('Product not found');
          setProduct(null);
          return;
        }
        
        setProduct(productData);
        
        // Fetch related products from the same category
        try {
          const response = await getProducts(
            { category: productData.category },
            1,
            4
          );
          const related = response.products
            .filter(p => p.id !== id)
            .slice(0, 4)
            .map(mapProductRowToProduct);
          setRelatedProducts(related);
        } catch (err) {
          console.error('Error fetching related products:', err);
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProduct();
  }, [id]);

  // Show loading state while params are being resolved
  if (isLoading || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
          </div>
          <p className="text-gray-300 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">Product Not Found</h1>
          <p className="text-gray-300 mb-8 max-w-md">
            {error || 'Sorry, we couldn\'t find the product you\'re looking for. Please browse our collections or try searching again.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href="/collections/men">Browse Men's Collection</Link>
            </Button>
            <Button asChild variant="secondary" className="border-amber-300 text-amber-300">
              <Link href="/collections/women">Browse Women's Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (product) {
      try {
        const appProduct = mapProductRowToProduct(product);
        await addItem(appProduct, quantity, selectedSize);
        console.log('✅ Added to cart:', product.name);
      } catch (error) {
        console.error('❌ Error adding to cart:', error);
        // Could add a toast notification here for user feedback
      }
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const sizes = product?.sizes as any;
    if (sizes && sizes[size]) {
      setCurrentPrice(sizes[size].price || 799);
    }
  };

  const getSizePrice = (): number => {
    const sizes = product?.sizes as any;
    if (sizes && sizes[selectedSize]) {
      return sizes[selectedSize].price || 799;
    }
    return 799;
  };

  const getSillageDescription = (sillage: string) => {
    switch (sillage) {
      case 'soft': return 'Intimate - Close to skin projection';
      case 'moderate': return 'Moderate - Arms length projection';
      case 'strong': return 'Strong - Room filling presence';
      default: return sillage;
    }
  };

  const getLongevityDescription = (hours: number) => {
    if (hours <= 4) return 'Poor (0-4 hours)';
    if (hours <= 6) return 'Weak (4-6 hours)';
    if (hours <= 8) return 'Moderate (6-8 hours)';
    if (hours <= 12) return 'Good (8-12 hours)';
    return 'Excellent (12+ hours)';
  };

  // JSON-LD Schema for SEO
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "ratingCount": "100"
    }
  };

  return (
    <div className="min-h-screen">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Premium Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link href="/" className="text-purple-300 hover:text-purple-200">
              Home
            </Link>
            <span className="text-purple-400/50">/</span>
            <Link 
              href={`/collections/${product.category}`}
              className="text-purple-300 hover:text-purple-200 capitalize"
            >
              {product.category === 'unisex' ? 'Unisex' : product.category}
            </Link>
            <span className="text-purple-400/50">/</span>
            <span className="text-purple-200">{product.name}</span>
          </div>

          {/* Back Button */}
          <Button
            variant="secondary"
            className="mb-6 border-purple-300 text-purple-300 hover:bg-purple-300/10"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="py-12 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 relative group">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 transform ${
                        selectedImageIndex === index
                          ? 'border-purple-500 shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              {/* Badges - With Gradient Icons */}
              <div className="flex gap-2 flex-wrap">
                {product.is_new && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-black dark:text-white">New Arrival</span>
                  </div>
                )}
                {product.is_best_seller && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-black dark:text-white">Best Seller</span>
                  </div>
                )}
                {product.is_on_sale && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                    <Flame className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-black dark:text-white">Limited Offer</span>
                  </div>
                )}
              </div>

              {/* Title and Brand */}
              <div className="space-y-2">
                <p className="text-purple-600 dark:text-purple-400 text-xs font-bold tracking-widest uppercase">
                  {product.brand}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white leading-tight tracking-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-slate-700 dark:text-gray-300 font-medium space-x-2">
                  <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 text-black dark:text-white">
                    {product.type}
                  </span>
                  <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 text-black dark:text-white">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.round(product.rating)
                          ? 'fill-purple-500 text-purple-500'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-black dark:text-white">
                    {formatRating(product.rating)}
                  </span>
                  <span className="text-slate-600 dark:text-gray-400 ml-1">
                    • 100+ reviews
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="space-y-2">
                <label className="font-bold text-black dark:text-white text-sm">
                  Choose Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['20ml', '50ml', '100ml'].map((size) => {
                    const sizes = product.sizes as any;
                    const price = sizes?.[size]?.price || (size === '20ml' ? 349 : size === '50ml' ? 599 : 799);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`py-2 px-3 rounded border-2 font-semibold transition-all text-xs ${
                          selectedSize === size
                            ? 'border-purple-500 bg-purple-50 dark:bg-slate-800 text-black dark:text-white'
                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div className="font-medium">{size}</div>
                        <div className="text-xs text-slate-600 dark:text-gray-400">{formatPrice(price)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Display */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                <p className="text-xs text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-widest font-bold">
                  Price
                </p>
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-bold text-black dark:text-white">
                    {formatPrice(getSizePrice())}
                  </span>
                  {product.original_price && (
                    <div className="flex items-end gap-1 pb-1">
                      <span className="text-sm text-slate-500 dark:text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                        -{Math.round((1 - getSizePrice() / product.original_price) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fragrance Notes */}
              <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                <h3 className="text-sm font-bold text-black dark:text-white">
                  Fragrance Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2">
                    <p className="font-bold text-black dark:text-white text-xs mb-1">Top Notes</p>
                    <p className="text-slate-700 dark:text-gray-300 text-xs leading-relaxed">
                      {product.notes && typeof product.notes === 'object' && 'top' in product.notes
                        ? (product.notes as any).top?.join(', ') || 'N/A'
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="font-bold text-black dark:text-white text-xs mb-1">Heart Notes</p>
                    <p className="text-slate-700 dark:text-gray-300 text-xs leading-relaxed">
                      {product.notes && typeof product.notes === 'object' && 'heart' in product.notes
                        ? (product.notes as any).heart?.join(', ') || 'N/A'
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-2">
                    <p className="font-bold text-black dark:text-white text-xs mb-1">Base Notes</p>
                    <p className="text-slate-700 dark:text-gray-300 text-xs leading-relaxed">
                      {product.notes && typeof product.notes === 'object' && 'base' in product.notes
                        ? (product.notes as any).base?.join(', ') || 'N/A'
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              {product.stock > 0 ? (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                  <p className="text-slate-700 dark:text-gray-300 font-bold flex items-center text-sm gap-2">
                    <span>✓</span>
                    <span>In Stock ({product.stock} available)</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                  <p className="text-slate-700 dark:text-gray-300 font-bold text-sm flex items-center gap-2">
                    <span>✗</span>
                    <span>Out of Stock</span>
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="font-bold text-black dark:text-white text-sm">
                    Qty:
                  </label>
                  <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold text-black dark:text-white text-sm"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-bold text-black dark:text-white text-sm border-l border-r border-slate-300 dark:border-slate-600">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold text-black dark:text-white text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 text-sm shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    size="sm"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="px-4 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 py-2"
                    size="sm"
                  >
                    <Heart 
                      className={`h-4 w-4 transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black dark:text-white'}`} 
                    />
                  </Button>
                </div>
              </div>

              {/* Features - With Simple Purple Outlined Icons */}
              <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                <div className="flex items-center text-black dark:text-white text-sm gap-3 font-medium">
                  <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>Free shipping on orders over ₹5000</span>
                </div>
                <div className="flex items-center text-black dark:text-white text-sm gap-3 font-medium">
                  <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>100% authentic guarantee</span>
                </div>
                <div className="flex items-center text-black dark:text-white text-sm gap-3 font-medium">
                  <RotateCcw className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>30-day hassle-free returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t-2 border-amber-200 dark:border-amber-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></span>
                <span className="text-amber-600 dark:text-amber-400 text-sm font-bold tracking-widest uppercase">✨ DISCOVER MORE</span>
                <span className="h-1 w-12 bg-gradient-to-l from-amber-500 to-orange-500 rounded-full"></span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                You May Also Love
              </h2>
              <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore other premium scents in our {product.category === 'men' ? "men's" : product.category === 'women' ? "women's" : "curated"} collection
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 py-4 px-8 text-lg" 
                asChild
              >
                <Link href={`/collections/${product.category}`}>
                  View All {product.category === 'men' ? "Men's" : "Women's"} Collection
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
