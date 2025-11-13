export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: 'men' | 'women' | 'unisex' | 'solid';
  type: 'EDP' | 'EDT' | 'Extrait' | 'Solid';
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: number; // hours
  sillage: 'soft' | 'moderate' | 'strong';
  rating: number;
  stock: number;
  description: string;
  sizes?: Record<string, { price?: number }>;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string | null; // e.g., '50ml', '100ml'
  unitPrice?: number;
  lineTotal?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  noteTypes: string[];
  longevity: number[];
  sillage: string[];
}

export type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating';