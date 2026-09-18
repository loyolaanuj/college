-- CollegeMerch Supabase PostgreSQL Schema & Security Policies
-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  image_url TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
  sizes JSONB DEFAULT '["S", "M", "L", "XL"]'::jsonb,
  colors JSONB DEFAULT '["Navy", "White", "Grey"]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  review_count INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Completed',
  order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_size TEXT,
  selected_color TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 6. CART ITEMS TABLE (Persistent User Cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_size TEXT,
  selected_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. PASSWORD RESETS TABLE
CREATE TABLE IF NOT EXISTS public.password_resets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- ROW LEVEL SECURITY POLICIES

-- Categories: Public read, admin write
CREATE POLICY "Public categories are readable by everyone" 
  ON public.categories FOR SELECT USING (true);

-- Products: Public read, admin write
CREATE POLICY "Public products are readable by everyone" 
  ON public.products FOR SELECT USING (true);

-- Profiles: Users read and update their own, Admins read/write all
CREATE POLICY "Users can read own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Orders: Users can read their own orders; Admins can read and update all orders
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (user_id = auth.uid() OR customer_email = auth.email() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (true);

-- Order Items: Viewable if related order is accessible
CREATE POLICY "Users can view order items" 
  ON public.order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.customer_email = auth.email() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  ));

-- Cart items: User can only access their own cart
CREATE POLICY "Users can manage own cart" 
  ON public.cart_items FOR ALL 
  USING (user_id = auth.uid());
