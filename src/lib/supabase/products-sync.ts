import { supabase } from './client';
import productsData from '@/data/products.json';

// Sync products from local JSON to Supabase
export async function syncProductsToSupabase(): Promise<void> {
  try {
    console.log('🔄 Starting product sync to Supabase...');
    
    for (const product of productsData) {
      const productData = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        original_price: product.originalPrice || null,
        images: product.images,
        category: product.category,
        type: product.type,
        notes: product.notes,
        longevity: product.longevity,
        sillage: product.sillage,
        rating: product.rating,
        stock: product.stock,
        description: product.description,
        is_new: product.isNew || false,
        is_best_seller: product.isBestSeller || false,
        is_on_sale: product.isOnSale || false,
        sizes: {
          '20ml': { price: 349, stock: Math.floor(product.stock / 3) },
          '50ml': { price: 599, stock: Math.floor(product.stock / 2) },
          '100ml': { price: 799, stock: product.stock }
        }
      };

      const { error } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error syncing product ${product.id}:`, error);
      } else {
        console.log(`✅ Synced product: ${product.name}`);
      }
    }
    
    console.log('🎉 Product sync completed!');
  } catch (error) {
    console.error('❌ Product sync failed:', error);
    throw error;
  }
}

// Get product by ID with fallback to local data
export async function getProductWithFallback(id: string): Promise<any> {
  try {
    // First try to get from Supabase
    const { data: supabaseProduct, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && supabaseProduct) {
      return supabaseProduct;
    }

    // Fallback to local data
    const localProduct = productsData.find(p => p.id === id);
    if (localProduct) {
      console.log(`📦 Using local data for product: ${localProduct.name}`);
      return {
        ...localProduct,
        images: localProduct.images,
        sizes: {
          '20ml': { price: 349, stock: Math.floor(localProduct.stock / 3) },
          '50ml': { price: 599, stock: Math.floor(localProduct.stock / 2) },
          '100ml': { price: 799, stock: localProduct.stock }
        }
      };
    }

    throw new Error(`Product not found: ${id}`);
  } catch (error) {
    console.error(`❌ Error getting product ${id}:`, error);
    throw error;
  }
}

// Helper function to enhance cart items with complete product data
export async function enhanceCartItemsWithProductData(cartItems: any[]): Promise<any[]> {
  const enhancedItems = [];
  
  for (const item of cartItems) {
    try {
      const product = await getProductWithFallback(item.product_id);
      enhancedItems.push({
        ...item,
        product_name: product.name,
        product_price: product.price,
        product_images: product.images,
        product_brand: product.brand,
        product_type: product.type
      });
    } catch (error) {
      console.error(`❌ Error enhancing cart item ${item.product_id}:`, error);
      // Use fallback data
      enhancedItems.push({
        ...item,
        product_name: 'Unknown Product',
        product_price: 799,
        product_images: ['/perfume-logo.png'],
        product_brand: 'Aura Élixir',
        product_type: 'EDP'
      });
    }
  }
  
  return enhancedItems;
}