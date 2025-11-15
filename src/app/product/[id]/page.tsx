import { ProductDetail } from '@/components/pages/ProductDetail';
import { getProduct, getProducts } from '@/lib/neon/products';
import type { Product as AppProduct } from '@/types';
import type { Product as NeonProduct } from '@/lib/neon/products';

export const revalidate = 120; // Revalidate every 2 minutes

function neonToAppProduct(p: NeonProduct): AppProduct {
  const category = ((): AppProduct['category'] => {
    const v = (p.category || '').toLowerCase();
    return v === 'men' || v === 'women' || v === 'unisex' || v === 'solid' ? v : 'unisex';
  })();

  const type = ((): AppProduct['type'] => {
    const v = (p.type || '').toUpperCase();
    return v === 'EDP' || v === 'EDT' || v === 'EXTRAIT' || v === 'SOLID' ? (v === 'EXTRAIT' ? 'Extrait' : (v as any)) : 'EDP';
  })();

  const sillage = ((): AppProduct['sillage'] => {
    const v = (p.sillage || '').toLowerCase();
    return v === 'soft' || v === 'moderate' || v === 'strong' ? v : 'moderate';
  })();

  const notes = (() => {
    const n = (p as any).notes || {};
    return {
      top: Array.isArray(n.top) ? n.top : [],
      heart: Array.isArray(n.heart) ? n.heart : [],
      base: Array.isArray(n.base) ? n.base : [],
    };
  })();

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    originalPrice: (p as any).original_price ?? undefined,
    images: p.images,
    category,
    type,
    notes,
    longevity: (p as any).longevity ?? 0,
    sillage,
    rating: p.rating,
    stock: p.stock,
    description: p.description,
    sizes: (p as any).sizes ?? {},
    isNew: (p as any).is_new ?? false,
    isBestSeller: (p as any).is_best_seller ?? false,
    isOnSale: (p as any).is_on_sale ?? false,
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const neonProduct = await getProduct(params.id);

  let related: AppProduct[] = [];
  if (neonProduct) {
    try {
      const resp = await getProducts({ category: neonProduct.category }, 1, 4);
      const filtered = (resp.products || []).filter(p => p.id !== neonProduct.id).slice(0, 4);
      related = filtered.map(neonToAppProduct);
    } catch {
      related = [];
    }
  }

  const appProduct: AppProduct | null = neonProduct ? neonToAppProduct(neonProduct) : null;

  return (
    <ProductDetail
      initialProduct={appProduct}
      initialRelated={related}
      prefetched={!!neonProduct}
    />
  );
}