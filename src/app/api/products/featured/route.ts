import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/neon/products';

export async function GET() {
  try {
    const result = await getFeaturedProducts();

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Failed to fetch featured products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
