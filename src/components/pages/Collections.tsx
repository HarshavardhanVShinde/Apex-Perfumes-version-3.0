"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
      {/* Premium Hero Section for Collections */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="text-amber-400 text-sm font-semibold tracking-widest">
            {activeCategory === 'men' ? 'FOR HIM' : 'FOR HER'}
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-white mb-4 mt-4">
            {categoryTitle}
          </h1>
          <p className="text-xl text-gray-100 tracking-wide font-light max-w-2xl mx-auto">
            {categoryDescription}
          </p>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {errorMessage && (
            <div className="mb-8 flex flex-col items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300">
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

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Products Found</h3>
              <p className="text-slate-600 dark:text-gray-300">
                We couldn't find any products in this category
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}