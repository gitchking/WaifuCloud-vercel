-- Add support for multiple images per wallpaper post
-- This allows up to 15 images per post

-- Step 1: Add images array column to wallpapers table
ALTER TABLE public.wallpapers 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Add image_count column for quick reference
ALTER TABLE public.wallpapers 
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 1;

-- Step 3: Migrate existing single images to array format
-- This ensures backward compatibility
UPDATE public.wallpapers 
SET images = ARRAY[image_url]::TEXT[]
WHERE images IS NULL OR array_length(images, 1) IS NULL;

-- Step 4: Update image_count based on images array
UPDATE public.wallpapers 
SET image_count = array_length(images, 1)
WHERE image_count IS NULL OR image_count = 0;

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_image_count ON public.wallpapers(image_count);

-- Step 6: Add constraint to limit max 15 images
ALTER TABLE public.wallpapers 
ADD CONSTRAINT max_15_images 
CHECK (array_length(images, 1) <= 15);

-- Step 7: Create function to add image to post
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
  IF (SELECT array_length(images, 1) FROM public.wallpapers WHERE id = wallpaper_id) >= 15 THEN
    RAISE EXCEPTION 'Maximum 15 images per post';
  END IF;
  
  -- Add image to array
  UPDATE public.wallpapers
  SET 
    images = array_append(images, new_image_url),
    image_count = array_length(images, 1) + 1,
    updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

GRANT EXECUTE ON FUNCTION add_image_to_wallpaper(UUID, TEXT) TO authenticated;

-- Step 8: Create function to remove image from post
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
    image_count = array_length(array_remove(images, image_url_to_remove), 1),
    updated_at = NOW()
  WHERE id = wallpaper_id;
END;
$$;

GRANT EXECUTE ON FUNCTION remove_image_from_wallpaper(UUID, TEXT) TO authenticated;

-- Verify the changes
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'wallpapers' 
AND column_name IN ('images', 'image_count', 'image_url')
ORDER BY column_name;

-- Show sample data
SELECT 
  id,
  title,
  image_url,
  images,
  image_count
FROM public.wallpapers
LIMIT 5;
