import type { Product } from '@/types'

export interface ListParams {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  isNew?: boolean
  isBestSeller?: boolean
  isOnSale?: boolean
  search?: string
  page?: number
  limit?: number
}

export async function fetchProducts(params: ListParams = {}) {
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.brand) qs.set('brand', params.brand)
  if (params.minPrice !== undefined) qs.set('minPrice', String(params.minPrice))
  if (params.maxPrice !== undefined) qs.set('maxPrice', String(params.maxPrice))
  if (params.isNew !== undefined) qs.set('isNew', String(params.isNew))
  if (params.isBestSeller !== undefined) qs.set('isBestSeller', String(params.isBestSeller))
  if (params.isOnSale !== undefined) qs.set('isOnSale', String(params.isOnSale))
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))

  const res = await fetch(`/api/products${qs.toString() ? `?${qs.toString()}` : ''}`)
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`)
  const json = await res.json()
  return {
    products: json.products as Product[],
    total: json.total as number,
    page: json.page as number,
    limit: json.limit as number,
    totalPages: json.totalPages as number,
  }
}

export async function fetchFeatured() {
  const res = await fetch('/api/products/featured')
  if (!res.ok) throw new Error(`Failed to load featured: ${res.status}`)
  const json = await res.json()
  return {
    newProducts: json.newProducts as Product[],
    bestSellers: json.bestSellers as Product[],
    onSale: json.onSale as Product[],
  }
}

export async function fetchProduct(id: string) {
  const res = await fetch(`/api/products/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to load product: ${res.status}`)
  const json = await res.json()
  return json as Product
}