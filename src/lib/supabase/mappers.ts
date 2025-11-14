import type { Product } from '@/types';
import type { Database } from '@/types/supabase';

export type SupabaseProductRow = Database['public']['Tables']['products']['Row'];

function normaliseNotes(notes: SupabaseProductRow['notes']): Product['notes'] {
  if (!notes || typeof notes !== 'object') {
    return { top: [], heart: [], base: [] };
  }

  const top = Array.isArray((notes as any).top) ? (notes as any).top : [];
  const heart = Array.isArray((notes as any).heart) ? (notes as any).heart : [];
  const base = Array.isArray((notes as any).base) ? (notes as any).base : [];

  return {
    top: top.map(String),
    heart: heart.map(String),
    base: base.map(String),
  };
}

function normaliseCategory(category: SupabaseProductRow['category']): Product['category'] {
  const allowed: Product['category'][] = ['men', 'women', 'unisex', 'solid'];
  return allowed.includes(category as Product['category']) ? (category as Product['category']) : 'unisex';
}

function normaliseType(type: SupabaseProductRow['type']): Product['type'] {
  const allowed: Product['type'][] = ['EDP', 'EDT', 'Extrait', 'Solid'];
  return allowed.includes(type as Product['type']) ? (type as Product['type']) : 'EDP';
}

function normaliseSillage(sillage: SupabaseProductRow['sillage']): Product['sillage'] {
  const allowed: Product['sillage'][] = ['soft', 'moderate', 'strong'];
  return allowed.includes(sillage as Product['sillage']) ? (sillage as Product['sillage']) : 'moderate';
}

function normaliseSizes(sizes: SupabaseProductRow['sizes']): Product['sizes'] | undefined {
  if (!sizes || typeof sizes !== 'object') {
    return undefined;
  }

  const entries = Object.entries(sizes as Record<string, any>);
  if (entries.length === 0) {
    return undefined;
  }

  return entries.reduce<Record<string, { price?: number }>>((acc, [sizeKey, value]) => {
    if (value && typeof value === 'object') {
      const rawPrice = (value as Record<string, unknown>).price;
      acc[sizeKey] = {
        price: typeof rawPrice === 'number' ? rawPrice : rawPrice !== undefined ? Number(rawPrice) : undefined,
      };
    } else {
      acc[sizeKey] = {};
    }
    return acc;
  }, {});
}

export function mapProductRowToProduct(row: SupabaseProductRow): Product {
  const rawImages = Array.isArray(row.images) ? row.images.map(String) : [];
  const images = rawImages.length > 0 ? rawImages : ['/perfume-logo.png'];

  return {
    id: String(row.id),
    name: row.name || '',
    brand: row.brand || 'Aura Élixir',
    price: Number(row.price ?? 0),
    originalPrice: row.original_price ?? undefined,
    images,
    category: normaliseCategory(row.category),
    type: normaliseType(row.type),
    notes: normaliseNotes(row.notes),
    longevity: Number(row.longevity ?? 0),
    sillage: normaliseSillage(row.sillage),
    rating: Number(row.rating ?? 0),
    stock: Number(row.stock ?? 0),
    description: row.description || '',
    sizes: normaliseSizes(row.sizes),
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    isOnSale: Boolean(row.is_on_sale),
  };
}
