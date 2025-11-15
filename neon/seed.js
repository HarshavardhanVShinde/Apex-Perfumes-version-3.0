/**
 * Seed products to Neon database
 * Run this script with: node neon/seed.js
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env.local file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please make sure .env.local exists and contains DATABASE_URL');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const products = [
  {
    // Let database generate UUID
    name: 'Cool Water',
    brand: 'Inspired',
    price: 1199.00,
    images: ['https://wnaxppdlvfcfeluxlvxn.supabase.co/storage/v1/object/public/product-images/Cool-Water.png'],
    category: 'men',
    type: 'EDP',
    notes: { top: ['Bergamot', 'Cardamom'], base: ['Amber', 'Musk'], heart: ['Oud', 'Rose'] },
    longevity: 10,
    sillage: 'strong',
    rating: 4.8,
    stock: 50,
    description: 'Inspired by luxury oud fragrances',
    is_new: false,
    is_best_seller: true,
    is_on_sale: false,
    sizes: { '20ml': { label: '20 ml', price: 349 }, '50ml': { label: '50 ml', price: 499 }, '100ml': { label: '100 ml', price: 699 } }
  },
  {
    // Let database generate UUID
    name: 'Most Wanted',
    brand: 'Inspired',
    price: 1199.00,
    images: ['https://wnaxppdlvfcfeluxlvxn.supabase.co/storage/v1/object/public/product-images/Most-Wanted.png'],
    category: 'men',
    type: 'EDP',
    notes: { top: ['Citrus', 'Spice'], base: ['Vanilla', 'Tonka'], heart: ['Iris', 'Leather'] },
    longevity: 9,
    sillage: 'strong',
    rating: 4.7,
    stock: 50,
    description: 'Inspired by intense noir fragrances',
    is_new: false,
    is_best_seller: true,
    is_on_sale: false,
    sizes: { '20ml': { label: '20 ml', price: 349 }, '50ml': { label: '50 ml', price: 499 }, '100ml': { label: '100 ml', price: 699 } }
  },
  {
    // Let database generate UUID
    name: 'Bleu De Chanel',
    brand: 'Inspired',
    price: 1199.00,
    images: ['https://wnaxppdlvfcfeluxlvxn.supabase.co/storage/v1/object/public/product-images/Bleu-De-Chanel.png'],
    category: 'men',
    type: 'EDP',
    notes: { top: ['Pineapple', 'Blackcurrant'], base: ['Oakmoss', 'Vanilla'], heart: ['Birch', 'Jasmine'] },
    longevity: 10,
    sillage: 'strong',
    rating: 4.9,
    stock: 50,
    description: 'Inspired by legendary fruity fragrances',
    is_new: true,
    is_best_seller: true,
    is_on_sale: false,
    sizes: { '20ml': { label: '20 ml', price: 349 }, '50ml': { label: '50 ml', price: 499 }, '100ml': { label: '100 ml', price: 699 } }
  },
  {
    // Let database generate UUID
    name: 'Dior Sauvage',
    brand: 'Inspired',
    price: 1199.00,
    images: ['https://wnaxppdlvfcfeluxlvxn.supabase.co/storage/v1/object/public/product-images/Dior-Sauvage.png'],
    category: 'men',
    type: 'EDT',
    notes: { top: ['Bergamot', 'Pepper'], base: ['Ambroxan', 'Cedar'], heart: ['Lavender', 'Geranium'] },
    longevity: 8,
    sillage: 'moderate',
    rating: 4.6,
    stock: 50,
    description: 'Inspired by wild fresh fragrances',
    is_new: false,
    is_best_seller: false,
    is_on_sale: false,
    sizes: { '20ml': { label: '20 ml', price: 349 }, '50ml': { label: '50 ml', price: 499 }, '100ml': { label: '100 ml', price: 699 } }
  },
  {
    // Let database generate UUID
    name: 'Gucci Flora',
    brand: 'Inspired',
    price: 1199.00,
    images: ['https://wnaxppdlvfcfeluxlvxn.supabase.co/storage/v1/object/public/product-images/Gucci-Flora.png'],
    category: 'women',
    type: 'EDP',
    notes: { top: ['Rose', 'Peony'], base: ['Musk', 'Sandalwood'], heart: ['Jasmine', 'Lily'] },
    longevity: 9,
    sillage: 'moderate',
    rating: 4.8,
    stock: 50,
    description: 'Inspired by elegant rose fragrances',
    is_new: false,
    is_best_seller: true,
    is_on_sale: false,
    sizes: { '20ml': { label: '20 ml', price: 349 }, '50ml': { label: '50 ml', price: 499 }, '100ml': { label: '100 ml', price: 699 } }
  }
];

async function seedProducts() {
  console.log('Starting product seeding...');
  
  for (const product of products) {
    try {
      await sql`
        INSERT INTO public.products (
          name, brand, price, original_price, images, category, type,
          notes, longevity, sillage, rating, stock, description,
          is_new, is_best_seller, is_on_sale, sizes
        ) VALUES (
          ${product.name},
          ${product.brand},
          ${product.price},
          ${product.original_price || null},
          ${product.images},
          ${product.category},
          ${product.type},
          ${JSON.stringify(product.notes)}::jsonb,
          ${product.longevity},
          ${product.sillage},
          ${product.rating},
          ${product.stock},
          ${product.description},
          ${product.is_new},
          ${product.is_best_seller},
          ${product.is_on_sale},
          ${JSON.stringify(product.sizes)}::jsonb
        )
      `;
      console.log(`✓ Seeded: ${product.name}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${product.name}:`, error.message);
    }
  }
  
  console.log('\nSeeding complete!');
  
  // Verify
  const result = await sql`SELECT COUNT(*) as count FROM public.products`;
  console.log(`Total products in database: ${result[0].count}`);
}

seedProducts().catch(console.error);
