import fallbackCatalog from '@/data/products.json';
import type { Product } from '@/types';

const ALLOWED_CATEGORIES: Product['category'][] = ['men', 'women', 'unisex', 'solid'];
const ALLOWED_TYPES: Product['type'][] = ['EDP', 'EDT', 'Extrait', 'Solid'];
const ALLOWED_SILLAGE: Product['sillage'][] = ['soft', 'moderate', 'strong'];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';
}

function normaliseFallbackProduct(raw: Partial<Product>): Product {
  const fallbackIdSource = `${raw.name ?? 'product'}-${raw.brand ?? 'aura élixir'}`;
  const safeId = raw.id ? String(raw.id) : `fallback-${slugify(fallbackIdSource)}`;

  const safeNotes = {
    top: Array.isArray(raw.notes?.top) ? raw.notes!.top.map(String) : [],
    heart: Array.isArray(raw.notes?.heart) ? raw.notes!.heart.map(String) : [],
    base: Array.isArray(raw.notes?.base) ? raw.notes!.base.map(String) : [],
  };

  const normalisedSizes = raw.sizes
    ? Object.entries(raw.sizes).reduce<Record<string, { price?: number }>>((acc, [sizeKey, sizeValue]) => {
        if (sizeValue && typeof sizeValue === 'object') {
          const maybePrice = (sizeValue as { price?: number }).price;
          acc[sizeKey] = {
            price: typeof maybePrice === 'number' ? maybePrice : maybePrice !== undefined ? Number(maybePrice) : undefined,
          };
        } else {
          acc[sizeKey] = {};
        }
        return acc;
      }, {})
    : undefined;

  const ensureCategory = ALLOWED_CATEGORIES.includes(raw.category as Product['category'])
    ? (raw.category as Product['category'])
    : 'unisex';
  const ensureType = ALLOWED_TYPES.includes(raw.type as Product['type'])
    ? (raw.type as Product['type'])
    : 'EDP';
  const ensureSillage = ALLOWED_SILLAGE.includes(raw.sillage as Product['sillage'])
    ? (raw.sillage as Product['sillage'])
    : 'moderate';

  return {
    id: safeId,
    name: raw.name ?? 'Aura Élixir Fragrance',
    brand: raw.brand ?? 'Aura Élixir',
    price: typeof raw.price === 'number' ? raw.price : Number(raw.price ?? 0),
    originalPrice: raw.originalPrice !== undefined
      ? (typeof raw.originalPrice === 'number' ? raw.originalPrice : Number(raw.originalPrice))
      : undefined,
    images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : ['/perfume-logo.png'],
    category: ensureCategory,
    type: ensureType,
    notes: safeNotes,
    longevity: typeof raw.longevity === 'number' ? raw.longevity : Number(raw.longevity ?? 0),
    sillage: ensureSillage,
    rating: typeof raw.rating === 'number' ? raw.rating : Number(raw.rating ?? 0),
    stock: typeof raw.stock === 'number' ? raw.stock : Number(raw.stock ?? 0),
    description: raw.description ?? '',
    sizes: normalisedSizes,
    isNew: Boolean(raw.isNew),
    isBestSeller: Boolean(raw.isBestSeller),
    isOnSale: Boolean(raw.isOnSale),
  };
}

const fallbackCatalogRaw = fallbackCatalog as Partial<Product>[];

export const fallbackProducts: Product[] = fallbackCatalogRaw.map(normaliseFallbackProduct);

export const fallbackSections = {
  bestSellers: fallbackProducts.filter(product => product.isBestSeller).slice(0, 4),
  newProducts: fallbackProducts.filter(product => product.isNew).slice(0, 4),
  men: fallbackProducts.filter(product => product.category === 'men').slice(0, 4),
  women: fallbackProducts.filter(product => product.category === 'women').slice(0, 4),
};

export function getFallbackProductsByCategory(category: Product['category']): Product[] {
  return fallbackProducts.filter(product => product.category === category);
}
