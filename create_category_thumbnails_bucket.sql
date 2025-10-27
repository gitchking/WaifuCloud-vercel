-- Create storage bucket for category thumbnails
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

-- Storage policies for category thumbnails
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Category thumbnails are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload category thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update category thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete category thumbnails" ON storage.objects;

-- Create new policies
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

-- Verify bucket creation
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'category-thumbnails';