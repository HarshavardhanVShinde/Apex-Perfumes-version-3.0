"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Truck, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/commerce/ProductCard';
import { getFeaturedProducts, getProducts } from '@/lib/supabase/products';
import { mapProductRowToProduct } from '@/lib/supabase/mappers';
import type { Product } from '@/types';
import { fallbackSections as FALLBACK_SECTIONS } from '@/lib/products/fallback';

export function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadProducts = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const [featuredResult, menResult, womenResult] = await Promise.allSettled([
        getFeaturedProducts(),
        getProducts({ category: 'men' }),
        getProducts({ category: 'women' }),
      ]);

      if (!mountedRef.current) {
        return;
      }

      let usedFallback = false;

      if (featuredResult.status === 'fulfilled') {
        const { newProducts: newItems, bestSellers: bestSellerItems } = featuredResult.value;
        const bestSellerProducts = (bestSellerItems ?? []).slice(0, 4).map(mapProductRowToProduct);
        const newestProducts = (newItems ?? []).slice(0, 4).map(mapProductRowToProduct);

        if (bestSellerProducts.length > 0) {
          setBestSellers(bestSellerProducts);
        } else {
          setBestSellers([...FALLBACK_SECTIONS.bestSellers]);
          usedFallback = true;
        }

        if (newestProducts.length > 0) {
          setNewProducts(newestProducts);
        } else {
          setNewProducts([...FALLBACK_SECTIONS.newProducts]);
          usedFallback = true;
        }
      } else {
        console.error('Failed to load featured products:', featuredResult.reason);
        setBestSellers([...FALLBACK_SECTIONS.bestSellers]);
        setNewProducts([...FALLBACK_SECTIONS.newProducts]);
        usedFallback = true;
      }

      if (menResult.status === 'fulfilled') {
        const menProductList = (menResult.value.products ?? []).slice(0, 4).map(mapProductRowToProduct);
        if (menProductList.length > 0) {
          setMenProducts(menProductList);
        } else {
          setMenProducts([...FALLBACK_SECTIONS.men]);
          usedFallback = true;
        }
      } else {
        console.error('Failed to load men products:', menResult.reason);
        setMenProducts([...FALLBACK_SECTIONS.men]);
        usedFallback = true;
      }

      if (womenResult.status === 'fulfilled') {
        const womenProductList = (womenResult.value.products ?? []).slice(0, 4).map(mapProductRowToProduct);
        if (womenProductList.length > 0) {
          setWomenProducts(womenProductList);
        } else {
          setWomenProducts([...FALLBACK_SECTIONS.women]);
          usedFallback = true;
        }
      } else {
        console.error('Failed to load women products:', womenResult.reason);
        setWomenProducts([...FALLBACK_SECTIONS.women]);
        usedFallback = true;
      }

      if (
        featuredResult.status === 'rejected' &&
        menResult.status === 'rejected' &&
        womenResult.status === 'rejected'
      ) {
        setErrorMessage('Unable to reach Supabase right now. Showing our offline catalog.');
      } else if (usedFallback) {
        setErrorMessage('Some sections are using cached data while live products refresh.');
      } else {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      if (!mountedRef.current) {
        return;
      }

      setBestSellers([...FALLBACK_SECTIONS.bestSellers]);
      setNewProducts([...FALLBACK_SECTIONS.newProducts]);
      setMenProducts([...FALLBACK_SECTIONS.men]);
      setWomenProducts([...FALLBACK_SECTIONS.women]);
      setErrorMessage('Unable to load live products. Showing cached catalog for now.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadProducts();

    return () => {
      mountedRef.current = false;
    };
  }, [loadProducts]);

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
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'The quality is exceptional. Royal Rose has become my signature scent.'
    },
    {
      name: 'Michael Chen',
      rating: 5,
      comment: 'Forest King is incredible. The longevity is amazing and I get compliments daily.'
    },
    {
      name: 'Emma Rodriguez',
      rating: 5,
      comment: 'Love the variety and quality. Aura Essence fragrances are truly luxury.'
    }
  ];

  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Carefully crafted with the finest ingredients'
    },
    {
      icon: Shield,
      title: 'Authentic Products',
      description: '100% genuine fragrances with quality guarantee'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Complimentary shipping on orders over $100'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="mb-6 inline-block">
            <span className="text-amber-400 text-sm font-semibold tracking-widest">LUXURY FRAGRANCES</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-wider text-white mb-6">
            Aura Essence
          </h1>
          <p className="text-2xl md:text-3xl text-gray-100 mb-8 tracking-wide font-light">
            Where Luxury Meets Artistry in Every Bottle
          </p>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover our curated collection of premium fragrances, each one a masterpiece crafted 
            to elevate your presence and express your unique essence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/collections/men">
                Explore Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="border-2 border-white text-white hover:bg-white/10" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-600 text-sm font-semibold tracking-widest">MOST LOVED</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 mt-4">
              Bestselling Fragrances
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our most coveted scents, chosen by connoisseurs worldwide
            </p>
          </div>

          {errorMessage && (
            <div className="mb-10 flex flex-col items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300">
              <p className="text-sm font-medium">{errorMessage}</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRetry}
                disabled={loading}
                className="border-amber-400 text-amber-700 dark:text-amber-300"
              >
                {loading ? 'Refreshing...' : 'Retry Now'}
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 animate-pulse">
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
            <Link href="/collections/men" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold">
              View All Best Sellers <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Men's Collection Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="flex-1">
              <span className="text-amber-600 text-sm font-semibold tracking-widest">FOR HIM</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 mt-4">
                Men's Collection
              </h2>
              <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
                Bold, sophisticated fragrances that capture the essence of modern masculinity. 
                From fresh and crisp to deep and woody, find your signature scent.
              </p>
              <Link href="/collections/men" className="inline-flex items-center px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:opacity-90 transition">
                Explore Men's <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 dark:bg-slate-800 rounded-lg aspect-square animate-pulse"></div>
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
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center mb-16">
            <div className="flex-1">
              <span className="text-amber-600 text-sm font-semibold tracking-widest">FOR HER</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 mt-4">
                Women's Collection
              </h2>
              <p className="text-lg text-slate-600 dark:text-gray-300 mb-8">
                Elegantly captivating fragrances that celebrate femininity and grace. 
                Discover floral, fruity, and oriental scents that turn heads.
              </p>
              <Link href="/collections/women" className="inline-flex items-center px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:opacity-90 transition">
                Explore Women's <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 dark:bg-slate-800 rounded-lg aspect-square animate-pulse"></div>
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
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-600 text-sm font-semibold tracking-widest">LATEST RELEASES</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 mt-4">
              New Arrivals
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fresh additions to our luxury fragrance collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 animate-pulse">
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
      <section className="py-16 px-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-amber-600 text-sm font-semibold tracking-widest">CUSTOMER REVIEWS</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 mt-4">
              Loved by Fragrance Enthusiasts
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-300">
              Join thousands of satisfied customers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-amber-600 text-sm font-semibold tracking-widest">OUR LEGACY</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8 mt-4">
            The Aura Essence Story
          </h2>
          <p className="text-lg text-slate-600 dark:text-gray-300 mb-8 leading-relaxed">
            Founded on the belief that fragrance is the ultimate form of self-expression, 
            Aura Essence creates distinctive scents that capture the essence of luxury and sophistication. 
            Each fragrance is meticulously crafted using the finest ingredients sourced from around the world, 
            resulting in complex, long-lasting compositions that evolve beautifully on your skin.
          </p>
          <Button size="lg" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90" asChild>
            <Link href="/about">Discover Our Journey</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}