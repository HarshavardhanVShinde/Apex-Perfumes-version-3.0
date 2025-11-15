import { sql } from './db';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  images: string[];
  category: 'men' | 'women' | 'unisex' | 'solid';
  type: 'EDP' | 'EDT' | 'Extrait' | 'Solid';
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: number;
  sillage: 'soft' | 'moderate' | 'strong';
  rating: number;
  stock: number;
  description: string;
  is_new: boolean;
  is_best_seller: boolean;
  is_on_sale: boolean;
  sizes: any;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  search?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get all products with optional filtering and pagination
export async function getProducts(
  filters: ProductFilters = {},
  page: number = 1,
  limit: number = 12
): Promise<ProductsResponse> {
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.category) {
    conditions.push(`category = $${paramIndex++}`);
    params.push(filters.category);
  }

  if (filters.brand) {
    conditions.push(`brand = $${paramIndex++}`);
    params.push(filters.brand);
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex++}`);
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex++}`);
    params.push(filters.maxPrice);
  }

  if (filters.isNew !== undefined) {
    conditions.push(`is_new = $${paramIndex++}`);
    params.push(filters.isNew);
  }

  if (filters.isBestSeller !== undefined) {
    conditions.push(`is_best_seller = $${paramIndex++}`);
    params.push(filters.isBestSeller);
  }

  if (filters.isOnSale !== undefined) {
    conditions.push(`is_on_sale = $${paramIndex++}`);
    params.push(filters.isOnSale);
  }

  if (filters.search) {
    conditions.push(
      `(name ILIKE $${paramIndex} OR brand ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    );
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total matching products
  const countQuery = `
    SELECT COUNT(*)::integer AS total
    FROM public.products
    ${whereClause}
  `;
  const countResult = await sql(countQuery, params);
  const total = countResult[0]?.total || 0;

  // Fetch paginated products
  const productsQuery = `
    SELECT id, name, brand, price, original_price, images, category, type, notes,
           rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
    FROM public.products
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex++}
    OFFSET $${paramIndex++}
  `;
  const products = await sql(productsQuery, [...params, limit, offset]);

  const totalPages = Math.ceil(total / limit);

  return {
    products: products.map(mapProduct),
    total,
    page,
    limit,
    totalPages,
  };
}

// Get a single product by ID
export async function getProduct(id: string): Promise<Product | null> {
  const result = await sql`
    SELECT * FROM public.products
    WHERE id = ${id}::uuid
  `;

  return result.length > 0 ? mapProduct(result[0]) : null;
}

// Get featured products
export async function getFeaturedProducts(): Promise<{
  newProducts: Product[];
  bestSellers: Product[];
  onSale: Product[];
}> {
  const [newProducts, bestSellers, onSale] = await Promise.all([
    sql`
      SELECT id, name, brand, price, original_price, images, category, type, notes,
             rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
      FROM public.products
      WHERE is_new = true
      ORDER BY created_at DESC
      LIMIT 8
    `,
    sql`
      SELECT id, name, brand, price, original_price, images, category, type, notes,
             rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
      FROM public.products
      WHERE is_best_seller = true
      ORDER BY rating DESC
      LIMIT 8
    `,
    sql`
      SELECT id, name, brand, price, original_price, images, category, type, notes,
             rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
      FROM public.products
      WHERE is_on_sale = true
      ORDER BY created_at DESC
      LIMIT 8
    `,
  ]);

  return {
    newProducts: newProducts.map(mapProduct),
    bestSellers: bestSellers.map(mapProduct),
    onSale: onSale.map(mapProduct),
  };
}

// Get products by category
export async function getProductsByCategory(category: string, limit: number = 12): Promise<Product[]> {
  const products = await sql`
    SELECT id, name, brand, price, original_price, images, category, type, notes,
           rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
    FROM public.products
    WHERE category = ${category}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return products.map(mapProduct);
}

// Get products by brand
export async function getProductsByBrand(brand: string, limit: number = 12): Promise<Product[]> {
  const products = await sql`
    SELECT id, name, brand, price, original_price, images, category, type, notes,
           rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
    FROM public.products
    WHERE brand = ${brand}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return products.map(mapProduct);
}

// Search products
export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  const searchTerm = `%${query}%`;

  const products = await sql`
    SELECT id, name, brand, price, original_price, images, category, type, notes,
           rating, is_new, is_best_seller, is_on_sale, created_at, updated_at, stock, sizes
    FROM public.products
    WHERE name ILIKE ${searchTerm}
       OR brand ILIKE ${searchTerm}
       OR description ILIKE ${searchTerm}
    ORDER BY rating DESC
    LIMIT ${limit}
  `;

  return products.map(mapProduct);
}

// Get all unique brands
export async function getBrands(): Promise<string[]> {
  const result = await sql`
    SELECT DISTINCT brand
    FROM public.products
    ORDER BY brand
  `;

  return result.map((row: any) => row.brand);
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  const result = await sql`
    SELECT DISTINCT category
    FROM public.products
    ORDER BY category
  `;

  return result.map((row: any) => row.category);
}

// Update product stock (admin function)
export async function updateProductStock(productId: string, newStock: number): Promise<Product> {
  const result = await sql`
    UPDATE public.products
    SET stock = ${newStock}, updated_at = now()
    WHERE id = ${productId}::uuid
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error('Product not found');
  }

  return mapProduct(result[0]);
}

// Create new product (admin function)
export async function createProduct(product: Partial<Product>): Promise<Product> {
  const result = await sql`
    INSERT INTO public.products (
      name, brand, price, original_price, images, category, type, notes,
      longevity, sillage, rating, stock, description, is_new, is_best_seller,
      is_on_sale, sizes
    ) VALUES (
      ${product.name}, ${product.brand}, ${product.price}, ${product.original_price},
      ${product.images}, ${product.category}, ${product.type || 'EDP'}, ${product.notes || {}},
      ${product.longevity || 0}, ${product.sillage || 'moderate'}, ${product.rating || 0},
      ${product.stock || 0}, ${product.description}, ${product.is_new || false},
      ${product.is_best_seller || false}, ${product.is_on_sale || false}, ${product.sizes || {}}
    )
    RETURNING *
  `;

  return mapProduct(result[0]);
}

// Helper to map DB row to Product type
function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: parseFloat(row.price),
    original_price: row.original_price ? parseFloat(row.original_price) : undefined,
    images: row.images,
    category: row.category,
    type: row.type,
    notes: row.notes,
    longevity: row.longevity,
    sillage: row.sillage,
    rating: parseFloat(row.rating),
    stock: row.stock,
    description: row.description,
    is_new: row.is_new,
    is_best_seller: row.is_best_seller,
    is_on_sale: row.is_on_sale,
    sizes: row.sizes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
