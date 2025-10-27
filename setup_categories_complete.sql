-- Complete setup for categories table and functionality
-- This script will create everything needed for categories to work

-- 1. Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (if any)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.categories;

-- 4. Create new RLS policies
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories (name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories (is_active);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories (created_at);

-- 6. Add trigger for updated_at (if function exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
        CREATE TRIGGER set_updated_at_categories
          BEFORE UPDATE ON public.categories
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- 7. Create storage bucket for category thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-thumbnails', 
  'category-thumbnails', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 8. Storage policies for category thumbnails
DROP POLICY IF EXISTS "Category thumbnails are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload category thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update category thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete category thumbnails" ON storage.objects;

CREATE POLICY "Category thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-thumbnails');

CREATE POLICY "Admins can upload category thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'category-thumbnails' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update category thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'category-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete category thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'category-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 9. Insert default categories
INSERT INTO public.categories (name, description, is_active) VALUES
  ('Anime', 'Beautiful anime characters, scenes, and artwork', true),
  ('Nature', 'Stunning landscapes, wildlife, and natural scenery', true),
  ('Abstract', 'Creative abstract art, patterns, and digital designs', true),
  ('Gaming', 'Video game characters, scenes, and gaming artwork', true),
  ('Cyberpunk', 'Futuristic cyberpunk themes and neon aesthetics', true)
ON CONFLICT (name) DO NOTHING;

-- 10. Verify everything is working
SELECT 
  'Categories table' as component,
  COUNT(*) as count,
  'Created successfully' as status
FROM public.categories
UNION ALL
SELECT 
  'Storage bucket' as component,
  COUNT(*) as count,
  'Created successfully' as status
FROM storage.buckets 
WHERE id = 'category-thumbnails'
UNION ALL
SELECT 
  'RLS policies' as component,
  COUNT(*) as count,
  'Created successfully' as status
FROM pg_policies 
WHERE tablename = 'categories';

-- 11. Show all categories
SELECT id, name, description, is_active, created_at 
FROM public.categories 
ORDER BY name;