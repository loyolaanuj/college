-- =========================================================
-- NEXUS Official Campus Store — Supabase PostgreSQL Schema
-- Run this SQL in your Supabase Project -> SQL Editor
-- =========================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 50,
    sizes JSONB DEFAULT '["S", "M", "L", "XL"]'::jsonb,
    colors JSONB DEFAULT '["Navy", "White"]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pin_code TEXT,
    payment_method TEXT DEFAULT 'UPI',
    payment_status TEXT DEFAULT 'Completed',
    payment_ref TEXT,
    order_status TEXT DEFAULT 'Pending',
    total_amount NUMERIC NOT NULL,
    shipping_fee NUMERIC DEFAULT 0,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) and Public Read Access
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products & categories
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
