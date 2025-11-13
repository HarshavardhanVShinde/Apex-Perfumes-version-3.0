import { supabase } from './client'
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']

export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  isNew?: boolean
  isBestSeller?: boolean
  isOnSale?: boolean
  search?: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Get all products with optional filtering and pagination
export async function getProducts(
  filters: ProductFilters = {},
  page: number = 1,
  limit: number = 12
): Promise<ProductsResponse> {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.brand) {
    query = query.eq('brand', filters.brand)
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  if (filters.isNew !== undefined) {
    query = query.eq('is_new', filters.isNew)
  }

  if (filters.isBestSeller !== undefined) {
    query = query.eq('is_best_seller', filters.isBestSeller)
  }

  if (filters.isOnSale !== undefined) {
    query = query.eq('is_on_sale', filters.isOnSale)
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    products: data || [],
    total: count || 0,
    page,
    limit,
    totalPages
  }
}

// Get a single product by ID
export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Product not found
    }
    throw error
  }

  return data
}

// Get featured products (new, best sellers, on sale)
export async function getFeaturedProducts(): Promise<{
  newProducts: Product[]
  bestSellers: Product[]
  onSale: Product[]
}> {
  const [newProducts, bestSellers, onSale] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(8),
    
    supabase
      .from('products')
      .select('*')
      .eq('is_best_seller', true)
      .order('rating', { ascending: false })
      .limit(8),
    
    supabase
      .from('products')
      .select('*')
      .eq('is_on_sale', true)
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  if (newProducts.error) throw newProducts.error
  if (bestSellers.error) throw bestSellers.error
  if (onSale.error) throw onSale.error

  return {
    newProducts: newProducts.data || [],
    bestSellers: bestSellers.data || [],
    onSale: onSale.data || []
  }
}

// Get products by category
export async function getProductsByCategory(category: string, limit: number = 12): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data || []
}

// Get products by brand
export async function getProductsByBrand(brand: string, limit: number = 12): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('brand', brand)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data || []
}

// Search products
export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data || []
}

// Get all unique brands
export async function getBrands(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .order('brand')

  if (error) {
    throw error
  }

  // Get unique brands
  const brands = [...new Set(data?.map(item => item.brand) || [])]
  return brands
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .order('category')

  if (error) {
    throw error
  }

  // Get unique categories
  const categories = [...new Set(data?.map(item => item.category) || [])]
  return categories
}

// Update product stock (admin function)
export async function updateProductStock(productId: string, newStock: number): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ 
      stock: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Create new product (admin function)
export async function createProduct(product: ProductInsert): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}