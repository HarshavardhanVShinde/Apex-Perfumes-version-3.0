import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type ProductRow = Database['public']['Tables']['products']['Row']

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      // PostgREST not found code
      if (error.code === 'PGRST116') {
        return new NextResponse(null, { status: 404 })
      }
      throw error
    }

    return new NextResponse(JSON.stringify(data as ProductRow), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Failed to fetch product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}