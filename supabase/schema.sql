-- Apex Perfumes Supabase schema snapshot
-- Generated to mirror the current application expectations (November 2025)

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_select_self'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_select_self ON public.profiles FOR SELECT USING (auth.uid() = id)';
  END IF;
END;
$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_update_self'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
  END IF;
END;
$$;

-- Products ------------------------------------------------------------------
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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'products'
      AND policyname = 'products_read'
  ) THEN
    EXECUTE 'CREATE POLICY products_read ON public.products FOR SELECT USING (TRUE)';
  END IF;
END;
$$;

-- Orders --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  total_amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND policyname = 'orders_owner_access'
  ) THEN
    EXECUTE 'CREATE POLICY orders_owner_access ON public.orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END;
$$;

-- Order items ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'order_items'
      AND policyname = 'order_items_owner_access'
  ) THEN
    EXECUTE 'CREATE POLICY order_items_owner_access ON public.order_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id))';
  END IF;
END;
$$;

-- Cart items ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  selected_size text DEFAULT '100ml',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_user_product_size
  ON public.cart_items (user_id, product_id, COALESCE(selected_size, '100ml'));
CREATE INDEX IF NOT EXISTS cart_items_user_id_idx
  ON public.cart_items (user_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cart_items'
      AND policyname = 'cart_items_owner_access'
  ) THEN
    EXECUTE 'CREATE POLICY cart_items_owner_access ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END;
$$;

-- Cart items view -----------------------------------------------------------
DROP VIEW IF EXISTS public.cart_items_view;
CREATE VIEW public.cart_items_view AS
SELECT
  ci.id,
  ci.user_id,
  ci.product_id,
  ci.quantity,
  ci.selected_size,
  p.name        AS product_name,
  p.images      AS product_images,
  COALESCE((p.sizes -> COALESCE(ci.selected_size, '100ml') ->> 'price')::numeric, p.price) AS product_price,
  COALESCE((p.sizes -> COALESCE(ci.selected_size, '100ml') ->> 'price')::numeric, p.price) AS size_price,
  ci.quantity * COALESCE((p.sizes -> COALESCE(ci.selected_size, '100ml') ->> 'price')::numeric, p.price) AS total_price
FROM public.cart_items ci
JOIN public.products p ON p.id = ci.product_id;

-- Helper functions ----------------------------------------------------------
DROP FUNCTION IF EXISTS public.upsert_cart_item(uuid, uuid, integer);
CREATE OR REPLACE FUNCTION public.upsert_cart_item(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.cart_items (user_id, product_id, quantity, selected_size)
  VALUES (p_user_id, p_product_id, p_quantity, '100ml')
  ON CONFLICT ON CONSTRAINT cart_items_unique_user_product_size
  DO UPDATE SET quantity = public.cart_items.quantity + EXCLUDED.quantity,
                updated_at = now();
END;
$$;

DROP FUNCTION IF EXISTS public.upsert_cart_item_with_size(uuid, uuid, integer, text);
CREATE OR REPLACE FUNCTION public.upsert_cart_item_with_size(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_selected_size text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.cart_items (user_id, product_id, quantity, selected_size)
  VALUES (p_user_id, p_product_id, p_quantity, COALESCE(p_selected_size, '100ml'))
  ON CONFLICT ON CONSTRAINT cart_items_unique_user_product_size
  DO UPDATE SET quantity = public.cart_items.quantity + EXCLUDED.quantity,
                updated_at = now();
END;
$$;

DROP FUNCTION IF EXISTS public.remove_cart_item(uuid, uuid);
CREATE OR REPLACE FUNCTION public.remove_cart_item(
  p_user_id uuid,
  p_product_id uuid
)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.cart_items
  WHERE user_id = p_user_id
    AND product_id::uuid = p_product_id
    AND COALESCE(selected_size, '100ml') = '100ml';
$$;

DROP FUNCTION IF EXISTS public.remove_cart_item_with_size(uuid, uuid, text);
CREATE OR REPLACE FUNCTION public.remove_cart_item_with_size(
  p_user_id uuid,
  p_product_id uuid,
  p_selected_size text
)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.cart_items
  WHERE user_id = p_user_id
    AND product_id::uuid = p_product_id
    AND COALESCE(selected_size, '100ml') = COALESCE(p_selected_size, '100ml');
$$;

DROP FUNCTION IF EXISTS public.set_cart_item_quantity(uuid, uuid, integer);
CREATE OR REPLACE FUNCTION public.set_cart_item_quantity(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.cart_items
  SET quantity = p_quantity,
      updated_at = now()
  WHERE user_id = p_user_id
    AND product_id::uuid = p_product_id
    AND COALESCE(selected_size, '100ml') = '100ml';
$$;

DROP FUNCTION IF EXISTS public.set_cart_item_quantity_with_size(uuid, uuid, integer, text);
CREATE OR REPLACE FUNCTION public.set_cart_item_quantity_with_size(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_selected_size text
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.cart_items
  SET quantity = p_quantity,
      updated_at = now()
  WHERE user_id = p_user_id
    AND product_id::uuid = p_product_id
    AND COALESCE(selected_size, '100ml') = COALESCE(p_selected_size, '100ml');
$$;

DROP FUNCTION IF EXISTS public.clear_cart(uuid);
CREATE OR REPLACE FUNCTION public.clear_cart(p_user_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
$$;

DROP FUNCTION IF EXISTS public.update_product_stock(uuid, integer);
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

DROP FUNCTION IF EXISTS public.calculate_cart_total(uuid);
CREATE OR REPLACE FUNCTION public.calculate_cart_total(p_user_id uuid)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
    NULLIF(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '^\S+\s?', ''), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;
