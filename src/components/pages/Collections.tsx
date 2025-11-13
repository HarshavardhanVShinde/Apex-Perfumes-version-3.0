"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { Product } from '@/types';
import { getProducts } from '@/lib/supabase/products';
import { useAuthStore } from '@/stores/auth';

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
  const { user } = useAuthStore();

  // Get category from URL parameters
  const category = (params.category as string)?.toLowerCase() || 'men';
  const categoryTitle = CATEGORY_TITLES[category] || "Fragrances";
  const categoryDescription = category === 'men' 
    ? 'Bold and sophisticated fragrances for the modern man'
    : 'Elegant and captivating scents for every occasion';

  // Validate category - redirect to /collections/men if invalid
  useEffect(() => {
    if (!VALID_CATEGORIES.includes(category)) {
      router.replace('/collections/men');
    }
  }, [category, router]);

  // Map Supabase product row into app Product type
  function mapRowToProduct(row: any): Product {
    const notes = row.notes || { top: [], heart: [], base: [] };
    return {
      id: String(row.id),
      name: row.name || '',
      brand: row.brand || '',
      price: Number(row.price ?? 0),
      originalPrice: row.original_price ?? undefined,
      images: Array.isArray(row.images) ? row.images : [],
      category: (row.category || category) as Product['category'],
      type: (row.type || 'EDP') as Product['type'],
      notes: {
        top: Array.isArray(notes.top) ? notes.top : [],
        heart: Array.isArray(notes.heart) ? notes.heart : [],
        base: Array.isArray(notes.base) ? notes.base : [],
      },
      longevity: Number(row.longevity ?? 0),
      sillage: (row.sillage || 'moderate') as Product['sillage'],
      rating: Number(row.rating ?? 0),
      stock: Number(row.stock ?? 0),
      description: row.description || '',
      isNew: !!row.is_new,
      isBestSeller: !!row.is_best_seller,
      isOnSale: !!row.is_on_sale,
    };
  }

  // Fetch products by category from Supabase
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const fetchData = async () => {
      try {
        const resp = await getProducts(
          {
            category: category, // Dynamic category
          },
          1,
          100
        );
        const mapped = (resp.products || []).map(mapRowToProduct);
        if (isMounted) {
          setProducts(mapped);
        }
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [category, user]); // Re-run when category or auth state changes

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
            {category === 'men' ? 'FOR HIM' : 'FOR HER'}
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