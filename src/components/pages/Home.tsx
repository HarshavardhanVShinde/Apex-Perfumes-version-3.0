"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Truck, Award, ChevronRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/commerce/ProductCard';
import { fetchFeatured, fetchProducts } from '@/lib/api/products';
import type { Product } from '@/types';

type HomeProps = {
  initialBestSellers?: Product[];
  initialNewProducts?: Product[];
  initialMenProducts?: Product[];
  initialWomenProducts?: Product[];
  prefetched?: boolean;
};

export function Home({
  initialBestSellers = [],
  initialNewProducts = [],
  initialMenProducts = [],
  initialWomenProducts = [],
  prefetched = false,
}: HomeProps) {
  const [bestSellers, setBestSellers] = useState<Product[]>(initialBestSellers);
  const [menProducts, setMenProducts] = useState<Product[]>(initialMenProducts);
  const [womenProducts, setWomenProducts] = useState<Product[]>(initialWomenProducts);
  const [newProducts, setNewProducts] = useState<Product[]>(initialNewProducts);
  const [loading, setLoading] = useState(!prefetched);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadProducts = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const [featuredResult, menResult, womenResult] = await Promise.allSettled([
        fetchFeatured(),
        fetchProducts({ category: 'men', limit: 4 }),
        fetchProducts({ category: 'women', limit: 4 }),
      ]);

      if (!mountedRef.current) {
        return;
      }

      if (featuredResult.status === 'fulfilled') {
        const { newProducts: newItems, bestSellers: bestSellerItems } = featuredResult.value;
        const bestSellerProducts = (bestSellerItems ?? []).slice(0, 4);
        const newestProducts = (newItems ?? []).slice(0, 4);

        if (bestSellerProducts.length > 0) {
          setBestSellers(bestSellerProducts);
        }

        if (newestProducts.length > 0) {
          setNewProducts(newestProducts);
        }
      } else {
        console.error('Failed to load featured products:', featuredResult.reason);
        setBestSellers([]);
        setNewProducts([]);
      }

      if (menResult.status === 'fulfilled') {
        const menProductList = (menResult.value.products ?? []).slice(0, 4);
        setMenProducts(menProductList);
      } else {
        console.error('Failed to load men products:', menResult.reason);
        setMenProducts([]);
      }

      if (womenResult.status === 'fulfilled') {
        const womenProductList = (womenResult.value.products ?? []).slice(0, 4);
        setWomenProducts(womenProductList);
      } else {
        console.error('Failed to load women products:', womenResult.reason);
        setWomenProducts([]);
      }

      if (featuredResult.status === 'rejected' && menResult.status === 'rejected' && womenResult.status === 'rejected') {
        setErrorMessage('Unable to reach the server right now.');
      } else if (featuredResult.status === 'rejected' || menResult.status === 'rejected' || womenResult.status === 'rejected') {
        setErrorMessage('Some sections failed to load.');
      } else {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      if (!mountedRef.current) {
        return;
      }

      setBestSellers([]);
      setNewProducts([]);
      setMenProducts([]);
      setWomenProducts([]);
      setErrorMessage('Unable to load products.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!prefetched) {
      void loadProducts();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [loadProducts, prefetched]);

  const handleRetry = useCallback(() => {
    if (!loading) {
      void loadProducts();
    }
  }, [loadProducts, loading]);

  const categories = [
    {
      name: 'Men\'s Collection',
      slug: 'men',
      image: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=500',
      description: 'Bold and sophisticated fragrances for the modern man'
    },
    {
      name: 'Women\'s Collection',
      slug: 'women',
      image: 'https://images.pexels.com/photos/1188440/pexels-photo-1188440.jpeg?auto=compress&cs=tinysrgb&w=500',
      description: 'Elegant and captivating scents for every occasion'
    }
  ];

  const testimonials = [
    {
      name: 'Elena Vasquez',
      rating: 5,
      comment: 'Aura Élixir Midnight Noir has become my signature scent. The depth and sophistication are unparalleled - I receive compliments wherever I go. Pure luxury in a bottle.'
    },
    {
      name: 'Marcus Thompson',
      rating: 5,
      comment: 'As a fragrance connoisseur, I\'ve tried countless brands. Aura Élixir stands apart with their masterful compositions and exceptional longevity. Forest King is simply extraordinary.'
    },
    {
      name: 'Sophia Chen',
      rating: 5,
      comment: 'The attention to detail in every Aura Élixir creation is remarkable. Royal Rose captures the essence of timeless elegance. Worth every penny of this premium experience.'
    }
  ];

  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Carefully crafted with the finest ingredients sourced globally'
    },
    {
      icon: Shield,
      title: 'Authentic Products',
      description: '100% genuine fragrances with quality guarantee and authenticity certificates'
    },
    {
      icon: Crown,
      title: 'Luxury Experience',
      description: 'Indulge in unparalleled sophistication and royal treatment with every purchase'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 text-center px-6 sm:px-4 max-w-4xl py-12">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest">LUXURY FRAGRANCES</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-wider text-white mb-4 sm:mb-6 leading-tight">
            Aura Élixir
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-100 mb-6 sm:mb-8 tracking-wide font-light px-2">
            Where Luxury Meets Artistry in Every Bottle
          </p>
          <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Discover our curated collection of premium fragrances, each one a masterpiece crafted 
            to elevate your presence and express your unique essence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 min-h-[56px] text-base font-semibold" asChild>
              <Link href="/collections/men">
                Explore Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm min-h-[56px] text-base font-semibold" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-purple-600 text-xs sm:text-sm font-semibold tracking-widest">MOST LOVED</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 mt-3 sm:mt-4 px-4">
              Bestselling Fragrances
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Our most coveted scents, chosen by connoisseurs worldwide
            </p>
          </div>

          {errorMessage && (
            <div className="mb-10 flex flex-col items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-center text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-300">
              <p className="text-sm font-medium">{errorMessage}</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRetry}
                disabled={loading}
                className="border-purple-400 text-purple-700 dark:text-purple-300"
              >
                {loading ? 'Refreshing...' : 'Retry Now'}
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-slate-900 rounded-xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded mb-2 w-3/4"></div>
                </div>
              ))
            ) : (
              bestSellers.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          
          <div className="text-center">
            <Link href="/collections/men" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-base sm:text-lg px-6 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
              View All Best Sellers <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Men's Collection Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center">
            <div className="flex-1 text-center md:text-left">
              <span className="text-purple-600 text-xs sm:text-sm font-semibold tracking-widest">FOR HIM</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 mt-3 sm:mt-4">
                Men's Collection
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Bold, sophisticated fragrances that capture the essence of modern masculinity.
                From fresh and crisp to deep and woody, find your signature scent.
              </p>
              <Link href="/collections/men" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl min-h-[56px] text-base">
                Explore Men's <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 dark:bg-slate-800 rounded-xl aspect-square animate-pulse"></div>
                  ))
                ) : (
                  menProducts.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Women's Collection Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-8 sm:gap-12 items-center">
            <div className="flex-1 text-center md:text-left">
              <span className="text-purple-600 text-xs sm:text-sm font-semibold tracking-widest">FOR HER</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 mt-3 sm:mt-4">
                Women's Collection
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Elegantly captivating fragrances that celebrate femininity and grace.
                Discover floral, fruity, and oriental scents that turn heads.
              </p>
              <Link href="/collections/women" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl min-h-[56px] text-base">
                Explore Women's <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 dark:bg-slate-800 rounded-xl aspect-square animate-pulse"></div>
                  ))
                ) : (
                  womenProducts.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-purple-600 text-xs sm:text-sm font-semibold tracking-widest">LATEST RELEASES</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 mt-3 sm:mt-4 px-4">
              New Arrivals
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Fresh additions to our luxury fragrance collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
                </div>
              ))
            ) : (
              newProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 sm:p-8 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 rounded-full mb-4 sm:mb-6 shadow-lg">
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-purple-600 text-xs sm:text-sm font-semibold tracking-widest">CUSTOMER REVIEWS</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 mt-3 sm:mt-4 px-4">
              Loved by Fragrance Enthusiasts
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 px-4">
              Join thousands of satisfied customers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                {/* Purple accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                
                <div className="flex items-center mb-4 sm:mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-purple-400 text-purple-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-gray-300 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {testimonial.name}
                  </p>
                  <div className="text-purple-600 dark:text-purple-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section - Premium Bottom CTA */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-purple-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-purple-950/20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-purple-600 text-xs sm:text-sm font-semibold tracking-widest">OUR LEGACY</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8 mt-3 sm:mt-4 px-4">
            The Aura Élixir Story
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed px-4">
            Since 2020, Aura Élixir has redefined luxury perfumery through unparalleled craftsmanship and innovation.
            Our master perfumers blend rare essences from the world's most prestigious regions, creating olfactory masterpieces
            that tell your unique story and leave an indelible impression.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white hover:scale-105 shadow-xl hover:shadow-2xl transition-all min-h-[56px] text-base font-semibold px-10" asChild>
            <Link href="/about">Explore Our Heritage</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}