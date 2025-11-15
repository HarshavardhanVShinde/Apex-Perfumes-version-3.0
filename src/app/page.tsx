import { Home } from '@/components/pages/Home';
import { getFeaturedProducts, getProductsByCategory } from '@/lib/neon/products';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Page() {
  const [featured, men, women] = await Promise.all([
    getFeaturedProducts(),
    getProductsByCategory('men', 4),
    getProductsByCategory('women', 4),
  ]);

  const initialBestSellers = (featured.bestSellers || []).slice(0, 4);
  const initialNewProducts = (featured.newProducts || []).slice(0, 4);
  const initialMenProducts = men || [];
  const initialWomenProducts = women || [];

  return (
    <Home
      initialBestSellers={initialBestSellers}
      initialNewProducts={initialNewProducts}
      initialMenProducts={initialMenProducts}
      initialWomenProducts={initialWomenProducts}
      prefetched
    />
  );
}