-- Quick Schema Check for Multiple Images Support
-- Run this in Supabase SQL Editor to check if migration is needed

-- Check if columns exist
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'wallpapers' 
  AND column_name IN ('images', 'image_count', 'image_url')
ORDER BY column_name;

-- If you see 'images' and 'image_count' columns, the schema is updated ✅
-- If you only see 'image_url', you need to run the migration ❌

-- Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('add_image_to_wallpaper', 'remove_image_from_wallpaper');

-- If you see both functions, they are created ✅
-- If empty result, you need to run the migration ❌

-- Check sample data (if table has data)
SELECT 
  COUNT(*) as total_posts,
  COUNT(images) as posts_with_images_array,
  COUNT(image_count) as posts_with_count
FROM public.wallpapers;

-- All three counts should be equal if migration is complete ✅
