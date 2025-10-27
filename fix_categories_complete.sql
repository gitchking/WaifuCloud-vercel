-- Complete fix for categories functionality
-- Run this script in Supabase SQL Editor

-- 1. Drop and recreate categories table to ensure clean state
DROP TABLE IF EXISTS public.categories CASCADE;

-- 2. Create categories table with all required columns
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- 5. Create RLS policies
-- Allow everyone to read categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- Allow admins to insert categories
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update categories
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete categories
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 6. Create category-thumbnails storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-thumbnails', 'category-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Set up storage policies for category-thumbnails bucket
-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public read access for category thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-thumbnails');

-- Allow admins to upload thumbnails
CREATE POLICY IF NOT EXISTS "Admins can upload category thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'category-thumbnails' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update thumbnails
CREATE POLICY IF NOT EXISTS "Admins can update category thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'category-thumbnails' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to delete thumbnails
CREATE POLICY IF NOT EXISTS "Admins can delete category thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'category-thumbnails' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 8. Insert some sample categories for testing
INSERT INTO public.categories (name, description, is_active) VALUES
  ('Anime', 'Beautiful anime wallpapers featuring characters and scenes from popular series', true),
  ('Nature', 'Stunning natural landscapes and scenery wallpapers', true),
  ('Gaming', 'Gaming-themed wallpapers from popular video games', true),
  ('Abstract', 'Modern abstract art and geometric designs', true)
ON CONFLICT (name) DO NOTHING;

-- 9. Verify setup
SELECT 'Categories table created' as status, COUNT(*) as sample_categories FROM public.categories;
SELECT 'RLS policies' as status, COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'categories';
SELECT 'Storage bucket' as status, name FROM storage.buckets WHERE id = 'category-thumbnails';