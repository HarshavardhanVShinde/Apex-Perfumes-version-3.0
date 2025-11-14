"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight, Home } from 'lucide-react';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { Product } from '@/types';
import { fetchProducts } from '@/lib/api/products';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const initialProducts: Product[] = [];

// Category mapping
const CATEGORY_TITLES: Record<string, string> = {
  men: "Men's Fragrances",
  women: "Women's Fragrances",
};

const VALID_CATEGORIES = ['men', 'women'];

export function Collections() {
  const params = useParams<{ category?: string }>() ?? {};
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get category from URL parameters
  const rawCategory = (params?.category ?? 'men').toLowerCase();
  const activeCategory = VALID_CATEGORIES.includes(rawCategory) ? rawCategory : 'men';
  const categoryTitle = CATEGORY_TITLES[activeCategory] || "Fragrances";
  const categoryDescription = activeCategory === 'men' 
    ? 'Bold and sophisticated fragrances for the modern man'
    : 'Elegant and captivating scents for every occasion';


  // Validate category - redirect to /collections/men if invalid
  useEffect(() => {
    if (!VALID_CATEGORIES.includes(rawCategory)) {
      router.replace('/collections/men');
    }
  }, [rawCategory, router]);

  // Fetch products by category from Supabase
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);
    const fetchData = async () => {
      try {
        const resp = await fetchProducts({ category: activeCategory, page: 1, limit: 24 });
        const mapped = resp.products ?? [];
        if (!isMounted) {
          return;
        }
        setProducts(mapped);
        setCurrentPage(1);
        setTotalPages(resp.totalPages || 1);
        setErrorMessage(null);
      } catch (e) {
        console.error('Failed to load products', e);
        if (isMounted) {
          setProducts([]);
          setErrorMessage('Unable to load products from Supabase.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, reloadToken]);

  const handleRetry = useCallback(() => {
    if (!loading) {
      setReloadToken(prev => prev + 1);
    }
  }, [loading]);

  const handleLoadMore = useCallback(async () => {
    if (loading || currentPage >= totalPages) return;
    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      const resp = await fetchProducts({ category: activeCategory, page: nextPage, limit: 24 });
      setProducts(prev => [...prev, ...(resp.products ?? [])]);
      setCurrentPage(nextPage);
      setTotalPages(resp.totalPages || totalPages);
    } catch (e) {
      console.error('Failed to load more products', e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentPage, totalPages, loading]);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <section className="py-4 px-4 sm:px-6 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="flex items-center text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-300 transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            <span className="text-purple-600 dark:text-purple-300 font-medium">
              {categoryTitle}
            </span>
          </nav>
        </div>
      </section>

      {/* Premium Hero Section for Collections - Mobile Optimized */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest">
              {activeCategory === 'men' ? 'FOR HIM' : 'FOR HER'}
            </span>
          </div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-white mb-3 sm:mb-4 mt-3 sm:mt-4 px-2 leading-tight ${
            activeCategory === 'men' 
              ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent'
          }`}>
            {categoryTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 tracking-wide font-light max-w-2xl mx-auto px-4 mb-4 sm:mb-6">
            {categoryDescription}
          </p>

          <p className="text-base sm:text-lg text-gray-200 max-w-3xl mx-auto px-4 mb-6 sm:mb-8 leading-relaxed">
            {activeCategory === 'men' 
              ? 'From woody earth tones to fresh aquatic notes, our men\'s collection features signature fragrances from renowned perfumers worldwide. Each scent is crafted with the finest ingredients for lasting impression and confidence.'
              : 'Elegant florals, sensual orientals, and sophisticated chypres define our women\'s collection. Discover fragrances that capture the essence of femininity, from delicate daytime scents to captivating evening aromas.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 min-h-[56px] text-base font-semibold" asChild>
              <Link href="#products">
                Shop Collection
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm min-h-[56px] text-base font-semibold" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Products Grid Section - Mobile First */}
      <section id="products" className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Discover Our Collection
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              Each fragrance is carefully crafted to capture the essence of luxury and sophistication
            </p>
          </div>
          {errorMessage && (
            <div className="mb-6 sm:mb-8 flex flex-col items-center gap-3 rounded-xl border-2 border-purple-200 bg-purple-50 px-4 sm:px-6 py-4 sm:py-5 text-center text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-300 shadow-lg">
              <p className="text-sm sm:text-base font-medium">{errorMessage}</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleRetry}
                disabled={loading}
                className="border-2 border-purple-400 text-purple-700 dark:text-purple-300 min-h-[48px] px-6 font-semibold"
              >
                {loading ? 'Refreshing...' : 'Retry Now'}
              </Button>
            </div>
          )}

          {/* Products Grid - Optimized for Mobile */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-slate-900 rounded-2xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full mb-6 shadow-lg">
                <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                No Products Found
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mb-6">
                Check back soon for new arrivals in our {categoryTitle.toLowerCase()}
              </p>
              <Button className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" asChild>
                <Link href="/">Browse All Collections</Link>
              </Button>
            </div>
          )}

          {/* Load more */}
          {products.length > 0 && currentPage < totalPages && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}