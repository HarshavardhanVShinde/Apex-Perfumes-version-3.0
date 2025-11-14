import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/neon/products';

function toBoolean(value: string | null | undefined): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === 'true' ? true : value === 'false' ? false : undefined;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const brand = url.searchParams.get('brand') || undefined;
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const isNew = toBoolean(url.searchParams.get('isNew'));
    const isBestSeller = toBoolean(url.searchParams.get('isBestSeller'));
    const isOnSale = toBoolean(url.searchParams.get('isOnSale'));
    const search = url.searchParams.get('search') || undefined;
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '12');

    const result = await getProducts(
      {
        category,
        brand,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isNew,
        isBestSeller,
        isOnSale,
        search,
      },
      page,
      limit
    );

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Failed to fetch products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
