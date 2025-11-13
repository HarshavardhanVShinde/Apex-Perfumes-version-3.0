import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type ProductRow = Database['public']['Tables']['products']['Row']

function toBoolean(value: string | null | undefined): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return value === 'true' ? true : value === 'false' ? false : undefined
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category') || undefined
    const brand = url.searchParams.get('brand') || undefined
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const isNew = toBoolean(url.searchParams.get('isNew'))
    const isBestSeller = toBoolean(url.searchParams.get('isBestSeller'))
    const isOnSale = toBoolean(url.searchParams.get('isOnSale'))
    const search = url.searchParams.get('search') || undefined
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '12')

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (category) query = query.eq('category', category)
    if (brand) query = query.eq('brand', brand)
    if (minPrice !== null) query = query.gte('price', Number(minPrice))
    if (maxPrice !== null) query = query.lte('price', Number(maxPrice))
    if (isNew !== undefined) query = query.eq('is_new', isNew)
    if (isBestSeller !== undefined) query = query.eq('is_best_seller', isBestSeller)
    if (isOnSale !== undefined) query = query.eq('is_on_sale', isOnSale)
    if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query
    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return new NextResponse(
      JSON.stringify({ products: (data as ProductRow[]) || [], total, page, limit, totalPages }),
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
      JSON.stringify({ error: err?.message || 'Failed to fetch products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}