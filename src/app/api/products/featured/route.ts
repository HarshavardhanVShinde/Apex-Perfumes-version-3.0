import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type ProductRow = Database['public']['Tables']['products']['Row']

export async function GET() {
  try {
    const [newProducts, bestSellers, onSale] = await Promise.all([
      supabase.from('products').select('*').eq('is_new', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('products').select('*').eq('is_best_seller', true).order('rating', { ascending: false }).limit(8),
      supabase.from('products').select('*').eq('is_on_sale', true).order('created_at', { ascending: false }).limit(8),
    ])

    if (newProducts.error) throw newProducts.error
    if (bestSellers.error) throw bestSellers.error
    if (onSale.error) throw onSale.error

    return new NextResponse(
      JSON.stringify({
        newProducts: (newProducts.data as ProductRow[]) || [],
        bestSellers: (bestSellers.data as ProductRow[]) || [],
        onSale: (onSale.data as ProductRow[]) || [],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600',
        },
      }
    )
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Failed to fetch featured products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}