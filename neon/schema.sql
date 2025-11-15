-- Apex Perfumes Neon schema
-- Adapted from Supabase schema to work with Stack Auth + Neon DB
-- Stack Auth manages users; we store user_id (string) references to Stack Auth users

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (references Stack Auth user IDs which are strings, not UUIDs)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,  -- Stack Auth user ID (string)
  email text,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  images text[] NOT NULL DEFAULT ARRAY[]::text[],
  category text NOT NULL,
  type text NOT NULL DEFAULT 'EDP',
  notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  longevity integer NOT NULL DEFAULT 0,
  sillage text NOT NULL DEFAULT 'moderate',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  is_new boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_on_sale boolean NOT NULL DEFAULT false,
  sizes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
CREATE INDEX IF NOT EXISTS products_is_new_idx ON public.products (is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON public.products (is_best_seller) WHERE is_best_seller = true;

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  total_amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

-- Cart items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  selected_size text DEFAULT '20ml',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_user_product_size
  ON public.cart_items (user_id, product_id, COALESCE(selected_size, '20ml'));
CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON public.cart_items (user_id);

-- Wishlist items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_unique_user_product
  ON public.wishlist_items (user_id, product_id);
CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON public.wishlist_items (user_id);

-- Cart items view with computed prices
DROP VIEW IF EXISTS public.cart_items_view;
CREATE VIEW public.cart_items_view AS
SELECT
  ci.id,
  ci.user_id,
  ci.product_id,
  ci.quantity,
  ci.selected_size,
  p.name        AS product_name,
  p.brand       AS product_brand,
  p.images      AS product_images,
  p.category    AS product_category,
  p.stock       AS product_stock,
  COALESCE((p.sizes -> COALESCE(ci.selected_size, '20ml') ->> 'price')::numeric, p.price) AS product_price,
  COALESCE((p.sizes -> COALESCE(ci.selected_size, '20ml') ->> 'price')::numeric, p.price) AS size_price,
  ci.quantity * COALESCE((p.sizes -> COALESCE(ci.selected_size, '20ml') ->> 'price')::numeric, p.price) AS total_price,
  ci.created_at,
  ci.updated_at
FROM public.cart_items ci
JOIN public.products p ON p.id = ci.product_id;

-- Wishlist items view
DROP VIEW IF EXISTS public.wishlist_items_view;
CREATE VIEW public.wishlist_items_view AS
SELECT
  wi.id,
  wi.user_id,
  wi.product_id,
  p.name AS product_name,
  p.brand AS product_brand,
  p.price AS product_price,
  p.images AS product_images,
  p.category AS product_category,
  p.stock AS product_stock,
  p.is_on_sale,
  wi.created_at
FROM public.wishlist_items wi
JOIN public.products p ON p.id = wi.product_id;

-- Helper function: Upsert cart item
CREATE OR REPLACE FUNCTION public.upsert_cart_item(
  p_user_id text,
  p_product_id uuid,
  p_quantity integer,
  p_selected_size text DEFAULT '100ml'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.cart_items (user_id, product_id, quantity, selected_size)
  VALUES (p_user_id, p_product_id, p_quantity, COALESCE(p_selected_size, '100ml'))
  ON CONFLICT ON CONSTRAINT cart_items_unique_user_product_size
  DO UPDATE SET 
    quantity = public.cart_items.quantity + EXCLUDED.quantity,
    updated_at = now();
END;
$$;

-- Helper function: Set cart item quantity
CREATE OR REPLACE FUNCTION public.set_cart_item_quantity(
  p_user_id text,
  p_product_id uuid,
  p_quantity integer,
  p_selected_size text DEFAULT '20ml'
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.cart_items
  SET quantity = p_quantity,
      updated_at = now()
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND COALESCE(selected_size, '20ml') = COALESCE(p_selected_size, '20ml');
$$;

-- Helper function: Remove cart item
CREATE OR REPLACE FUNCTION public.remove_cart_item(
  p_user_id text,
  p_product_id uuid,
  p_selected_size text DEFAULT '20ml'
)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.cart_items
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND COALESCE(selected_size, '20ml') = COALESCE(p_selected_size, '20ml');
$$;

-- Helper function: Clear cart
CREATE OR REPLACE FUNCTION public.clear_cart(p_user_id text)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
$$;

-- Helper function: Calculate cart total with promotions
CREATE OR REPLACE FUNCTION public.calculate_cart_total(p_user_id text)
RETURNS TABLE (
  subtotal numeric,
  discount numeric,
  total numeric,
  promotion_text text
)
LANGUAGE sql
AS $$
  WITH base AS (
    SELECT
      COALESCE(SUM(total_price), 0)::numeric AS subtotal,
      COALESCE(SUM(CASE WHEN COALESCE(selected_size, '100ml') = '100ml' THEN quantity ELSE 0 END), 0)::numeric AS qty_100ml,
      COALESCE(AVG(CASE WHEN COALESCE(selected_size, '100ml') = '100ml' THEN product_price END), 799)::numeric AS price_100ml
    FROM public.cart_items_view
    WHERE user_id = p_user_id
  ), promo AS (
    SELECT
      subtotal,
      FLOOR(qty_100ml / 2)::numeric * price_100ml AS discount
    FROM base
  )
  SELECT
    base.subtotal,
    promo.discount,
    base.subtotal - promo.discount AS total,
    CASE
      WHEN promo.discount > 0 THEN 'Buy 2 Get 1 Free on 100ml bottles'
      ELSE NULL
    END AS promotion_text
  FROM base
  CROSS JOIN promo;
$$;

-- Helper function: Update product stock
CREATE OR REPLACE FUNCTION public.update_product_stock(
  p_product_id uuid,
  p_quantity_sold integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(stock - p_quantity_sold, 0),
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

-- Helper function: Add to wishlist
CREATE OR REPLACE FUNCTION public.add_to_wishlist(
  p_user_id text,
  p_product_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.wishlist_items (user_id, product_id)
  VALUES (p_user_id, p_product_id)
  ON CONFLICT ON CONSTRAINT wishlist_items_unique_user_product
  DO NOTHING;
END;
$$;

-- Helper function: Remove from wishlist
CREATE OR REPLACE FUNCTION public.remove_from_wishlist(
  p_user_id text,
  p_product_id uuid
)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.wishlist_items
  WHERE user_id = p_user_id
    AND product_id = p_product_id;
$$;

COMMIT;
