import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/neon/products';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProduct(params.id);

    if (!product) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Failed to fetch product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
