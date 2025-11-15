"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronRight, Sparkles, Flame, Award } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/commerce/ProductCard';
import { formatPrice, formatRating } from '@/lib/utils';
import { fetchProduct as fetchProductApi, fetchProducts } from '@/lib/api/products';
import type { Product as AppProduct } from '@/types';

type Product = AppProduct;

type ProductDetailProps = {
  initialProduct?: AppProduct | null;
  initialRelated?: AppProduct[];
  prefetched?: boolean;
};

export function ProductDetail({ initialProduct = null, initialRelated = [], prefetched = false }: ProductDetailProps) {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(!prefetched);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<AppProduct[]>(initialRelated);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('20ml');
  const [currentPrice, setCurrentPrice] = useState<number>(349);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  // Fetch product and related products via API if not prefetched
  useEffect(() => {
    if (prefetched) return;
    async function loadProductData() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const productData = await fetchProductApi(id);
        if (!productData) {
          setError('Product not found');
          setProduct(null);
          return;
        }
        setProduct(productData as any);
        try {
          const response = await fetchProducts({ category: productData.category, page: 1, limit: 4 });
          const related = response.products.filter(p => p.id !== id).slice(0, 4);
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
    loadProductData();
  }, [id, prefetched]);

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
        await addItem(product, quantity, selectedSize);
        // console.log('✅ Added to cart:', product.name);
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
      setCurrentPrice(sizes[size].price || 699);
    }
  };

  const getSizePrice = (): number => {
    const sizes = product?.sizes as any;
    if (sizes && sizes[selectedSize]) {
      return sizes[selectedSize].price || (selectedSize === '20ml' ? 349 : selectedSize === '50ml' ? 499 : 699);
    }
    return selectedSize === '20ml' ? 349 : selectedSize === '50ml' ? 499 : 699;
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

      {/* Premium Hero Section - Mobile Optimized */}
      <section className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb - Mobile Optimized */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 text-xs sm:text-sm flex-wrap">
            <Link href="/" className="text-amber-400 hover:text-amber-300 transition-colors">
              Home
            </Link>
            <span className="text-purple-400/50">/</span>
            <Link 
              href={`/collections/${product.category}`}
              className="text-amber-400 hover:text-amber-300 capitalize transition-colors"
            >
              {product.category === 'unisex' ? 'Unisex' : product.category}
            </Link>
            <span className="text-purple-400/50">/</span>
            <span className="text-gray-200 line-clamp-1">{product.name}</span>
          </div>

          {/* Back Button - Larger Touch Target */}
          <Button
            variant="secondary"
            className="mb-4 sm:mb-6 border-2 border-amber-400 text-amber-400 hover:bg-amber-400/20 min-h-[44px] px-6 font-semibold"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </section>

      {/* Main Product Section - Mobile First */}
      <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Product Images - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 relative group shadow-xl">
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-110 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 transform shadow-md min-h-[60px] sm:min-h-[80px] ${
                        selectedImageIndex === index
                          ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={96}
                        height={96}
                        className="object-cover hover:scale-110 transition-transform duration-300 w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Mobile Optimized */}
            <div className="space-y-4 sm:space-y-5">
              {/* Badges - Mobile Friendly */}
              <div className="flex gap-2 flex-wrap">
                {product.isNew && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-amber-400 shadow-md">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">New Arrival</span>
                  </div>
                )}
                {product.isBestSeller && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-amber-400 shadow-md">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">Best Seller</span>
                  </div>
                )}
                {product.isOnSale && (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-amber-400 shadow-md">
                    <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">Limited Offer</span>
                  </div>
                )}
              </div>

              {/* Title and Brand - Mobile Typography */}
              <div className="space-y-2">
                <p className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-bold tracking-widest uppercase">
                  {product.brand}
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white leading-tight tracking-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 font-medium space-x-2">
                  <span className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 text-black dark:text-white">
                    {product.type}
                  </span>
                  <span className="inline-block px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 text-black dark:text-white">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                </p>
              </div>

              {/* Rating - Mobile Enhanced */}
              <div className="flex items-center space-x-2 p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600 shadow-md">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        i < Math.round(product.rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-black dark:text-white">
                    {formatRating(product.rating)}
                  </span>
                  <span className="text-slate-600 dark:text-gray-400 ml-1">
                    • 100+ reviews
                  </span>
                </div>
              </div>

              {/* Description - Mobile Readability */}
              <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection - Mobile Enhanced */}
              <div className="space-y-3">
                <label className="font-bold text-black dark:text-white text-sm sm:text-base">
                  Choose Size
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {['20ml', '50ml', '100ml'].map((size) => {
                    const sizes = product.sizes as any;
                    const price = sizes?.[size]?.price || (size === '20ml' ? 349 : size === '50ml' ? 499 : 699);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`py-3 sm:py-4 px-3 rounded-xl border-2 font-semibold transition-all text-xs sm:text-sm min-h-[60px] sm:min-h-[70px] flex flex-col items-center justify-center shadow-md hover:scale-105 ${
                          selectedSize === size
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 text-black dark:text-white ring-2 ring-amber-400/50'
                            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-300 hover:border-amber-400 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-sm sm:text-base">{size}</div>
                        <div className="text-xs text-slate-600 dark:text-gray-400 mt-1">{formatPrice(price)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Display - Mobile Prominent */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-lg">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mb-2 uppercase tracking-widest font-bold">
                  Price
                </p>
                <div className="flex items-end space-x-2 sm:space-x-3">
                  <span className="text-3xl sm:text-4xl font-bold text-black dark:text-white">
                    {formatPrice(getSizePrice())}
                  </span>
                  {product.originalPrice && (
                    <div className="flex items-end gap-1 sm:gap-2 pb-1">
                      <span className="text-sm sm:text-base text-slate-500 dark:text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 sm:px-3 py-1 rounded-lg">
                        -{Math.round((1 - getSizePrice() / product.originalPrice) * 100)}%
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

              {/* Stock Status - Mobile Enhanced */}
              {product.stock > 0 ? (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md">
                  <p className="text-green-800 dark:text-green-300 font-bold flex items-center text-sm sm:text-base gap-2">
                    <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                    <span>In Stock ({product.stock} available)</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-md">
                  <p className="text-red-800 dark:text-red-300 font-bold text-sm sm:text-base flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400 text-lg">✗</span>
                    <span>Out of Stock</span>
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart - Mobile Optimized */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="font-bold text-black dark:text-white text-sm sm:text-base">
                    Qty:
                  </label>
                  <div className="flex items-center border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 shadow-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 sm:px-5 py-3 sm:py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold text-black dark:text-white text-base sm:text-lg min-w-[48px] min-h-[48px]"
                    >
                      −
                    </button>
                    <span className="px-5 sm:px-6 py-3 sm:py-4 font-bold text-black dark:text-white text-base sm:text-lg border-l-2 border-r-2 border-slate-300 dark:border-slate-600 min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 sm:px-5 py-3 sm:py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold text-black dark:text-white text-base sm:text-lg min-w-[48px] min-h-[48px]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 sm:py-5 text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] rounded-xl"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="px-5 sm:px-6 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 py-4 sm:py-5 min-w-[56px] min-h-[56px] rounded-xl shadow-lg"
                  >
                    <Heart 
                      className={`h-5 w-5 transition-all ${
                        isWishlisted ? 'fill-red-500 text-red-500' : 'text-black dark:text-white'
                      }`} 
                    />
                  </Button>
                </div>
              </div>

              {/* Features - Mobile Enhanced */}
              <div className="space-y-3 sm:space-y-4 p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-lg">
                <div className="flex items-center text-black dark:text-white text-sm sm:text-base gap-3 sm:gap-4 font-medium">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>Free shipping on orders over ₹5000</span>
                </div>
                <div className="flex items-center text-black dark:text-white text-sm sm:text-base gap-3 sm:gap-4 font-medium">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>100% authentic guarantee</span>
                </div>
                <div className="flex items-center text-black dark:text-white text-sm sm:text-base gap-3 sm:gap-4 font-medium">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                  </div>
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
