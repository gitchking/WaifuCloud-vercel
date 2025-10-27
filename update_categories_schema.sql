-- Update categories table to remove slug and add thumbnail support
-- Drop the slug column and related constraints
ALTER TABLE public.categories DROP COLUMN IF EXISTS slug;

-- Ensure thumbnail_url column exists
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create storage bucket for category thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-thumbnails', 'category-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for category thumbnails
DROP POLICY IF EXISTS "Category thumbnails are publicly accessible" ON storage.objects;
CREATE POLICY "Category thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-thumbnails');

DROP POLICY IF EXISTS "Admins can upload category thumbnails" ON storage.objects;
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

DROP POLICY IF EXISTS "Admins can update category thumbnails" ON storage.objects;
CREATE POLICY "Admins can update category thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'category-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete category thumbnails" ON storage.objects;
CREATE POLICY "Admins can delete category thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'category-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Update existing categories to remove any slug-based constraints
-- The name will now be the primary identifier (already unique)

-- Update default categories with better descriptions
UPDATE public.categories 
SET description = CASE 
  WHEN name = 'Anime' THEN 'Beautiful anime characters, scenes, and artwork'
  WHEN name = 'Nature' THEN 'Stunning landscapes, wildlife, and natural scenery'
  WHEN name = 'Abstract' THEN 'Creative abstract art, patterns, and digital designs'
  WHEN name = 'Gaming' THEN 'Video game characters, scenes, and gaming artwork'
  WHEN name = 'Cyberpunk' THEN 'Futuristic cyberpunk themes and neon aesthetics'
  ELSE description
END
WHERE name IN ('Anime', 'Nature', 'Abstract', 'Gaming', 'Cyberpunk');