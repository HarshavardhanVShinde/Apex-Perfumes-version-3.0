"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { Product } from '@/types';
import { fetchProducts } from '@/lib/api/products';
import { Button } from '@/components/ui/Button';

// Supabase-backed products state
const initialProducts: Product[] = [];

// Category mapping
const CATEGORY_TITLES: Record<string, string> = {
  men: "Men's Fragrances",
  women: "Women's Fragrances",
};

const VALID_CATEGORIES = ['men', 'women'];

export function Collections() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Get category from URL parameters
  const rawCategory = (params.category as string)?.toLowerCase() || 'men';
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
        const resp = await fetchProducts({ category: activeCategory, page: 1, limit: 100 });
        const mapped = resp.products ?? [];
        if (!isMounted) {
          return;
        }

        setProducts(mapped);
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

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section for Collections - Mobile Optimized */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="text-amber-400 text-xs sm:text-sm font-semibold tracking-widest">
            {activeCategory === 'men' ? 'FOR HIM' : 'FOR HER'}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-white mb-3 sm:mb-4 mt-3 sm:mt-4 px-2 leading-tight">
            {categoryTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 tracking-wide font-light max-w-2xl mx-auto px-4">
            {categoryDescription}
          </p>
        </div>
      </section>

      {/* Products Grid Section - Mobile First */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {errorMessage && (
            <div className="mb-6 sm:mb-8 flex flex-col items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 sm:px-6 py-4 sm:py-5 text-center text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300 shadow-lg">
              <p className="text-sm sm:text-base font-medium">{errorMessage}</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleRetry}
                disabled={loading}
                className="border-2 border-amber-400 text-amber-700 dark:text-amber-300 min-h-[48px] px-6 font-semibold"
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
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full mb-6 shadow-lg">
                <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                No Products Found
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400">
                Check back soon for new arrivals
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}