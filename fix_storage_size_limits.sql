-- Fix Storage Size Limits for Supabase Buckets
-- Run this in Supabase SQL Editor

-- Check current bucket settings
SELECT 
  id,
  name,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- Update wallpapers bucket - increase to 50MB per file
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE name = 'wallpapers';

-- Update category-thumbnails bucket - increase to 10MB per file
UPDATE storage.buckets
SET file_size_limit = 10485760  -- 10MB in bytes
WHERE name = 'category-thumbnails';

-- Verify the changes
SELECT 
  name,
  file_size_limit,
  ROUND(file_size_limit / 1024.0 / 1024.0, 2) as size_limit_mb,
  allowed_mime_types
FROM storage.buckets
WHERE name IN ('wallpapers', 'category-thumbnails');

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Storage limits updated:';
  RAISE NOTICE '- wallpapers: 50MB per file';
  RAISE NOTICE '- category-thumbnails: 10MB per file';
END $$;
