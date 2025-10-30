-- Apply Multiple Images Support to Database
-- Run this in your Supabase SQL Editor

-- Step 1: Add images array column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallpapers' AND column_name = 'images'
  ) THEN
    ALTER TABLE public.wallpapers 
    ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
END $$;

-- Step 2: Add image_count column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallpapers' AND column_name = 'image_count'
  ) THEN
    ALTER TABLE public.wallpapers 
    ADD COLUMN image_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- Step 3: Migrate existing single images to array format
UPDATE public.wallpapers 
SET images = ARRAY[image_url]::TEXT[]
WHERE images IS NULL OR array_length(images, 1) IS NULL;

-- Step 4: Update image_count based on images array
UPDATE public.wallpapers 
SET image_count = COALESCE(array_length(images, 1), 1)
WHERE image_count IS NULL OR image_count = 0;

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_image_count 
ON public.wallpapers(image_count);

-- Step 6: Drop existing constraint if it exists (to avoid conflicts)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'max_15_images'
  ) THEN
    ALTER TABLE public.wallpapers DROP CONSTRAINT max_15_images;
  END IF;
END $$;

-- Step 7: Add constraint to limit max 15 images
ALTER TABLE public.wallpapers 
ADD CONSTRAINT max_15_images 
CHECK (array_length(images, 1) <= 15);

-- Step 8: Create or replace function to add image to post
CREATE OR REPLACE FUNCTION add_image_to_wallpaper(
  wallpaper_id UUID,
  new_image_url TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user owns this wallpaper
  IF NOT EXISTS (
    SELECT 1 FROM public.wallpapers 
    WHERE id = wallpaper_id 
    AND uploaded_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only add images to your own wallpapers';
  END IF;
  
  -- Check if already at max images
  IF (SELECT COALESCE(array_length(images, 1), 0) FROM public.wallpapers WHERE id = wallpaper_id) >= 15 THEN
    RAISE EXCEPTION 'Maximum 15 images per post';
  END IF;
  
  -- Add image to array
  UPDATE public.wallpapers
  SET 
    images = array_append(COALESCE(images, ARRAY[]::TEXT[]), new_image_url),
    image_count = COALESCE(array_length(images, 1), 0) + 1,
    updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

-- Step 9: Create or replace function to remove image from post
CREATE OR REPLACE FUNCTION remove_image_from_wallpaper(
  wallpaper_id UUID,
  image_url_to_remove TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user owns this wallpaper
  IF NOT EXISTS (
    SELECT 1 FROM public.wallpapers 
    WHERE id = wallpaper_id 
    AND uploaded_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only remove images from your own wallpapers';
  END IF;
  
  -- Remove image from array
  UPDATE public.wallpapers
  SET 
    images = array_remove(images, image_url_to_remove),
    image_count = COALESCE(array_length(array_remove(images, image_url_to_remove), 1), 0),
    updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

-- Step 10: Grant permissions
GRANT EXECUTE ON FUNCTION add_image_to_wallpaper(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_image_from_wallpaper(UUID, TEXT) TO authenticated;

-- Verification: Check the schema
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wallpapers' 
AND column_name IN ('images', 'image_count', 'image_url')
ORDER BY column_name;

-- Verification: Check sample data
SELECT 
  id,
  title,
  image_url,
  images,
  image_count,
  array_length(images, 1) as actual_array_length
FROM public.wallpapers
LIMIT 5;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Multiple images support has been successfully applied!';
  RAISE NOTICE 'You can now upload up to 15 images per post.';
END $$;
