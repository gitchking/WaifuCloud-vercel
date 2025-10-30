-- QUICK MIGRATION - Copy and paste this entire block into Supabase SQL Editor
-- This is the minimal version to get multiple images working

-- Add the columns
ALTER TABLE public.wallpapers 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 1;

-- Migrate existing data to use arrays
UPDATE public.wallpapers 
SET images = ARRAY[image_url]::TEXT[],
    image_count = 1
WHERE images IS NULL OR array_length(images, 1) IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_image_count ON public.wallpapers(image_count);

-- Add constraint (max 15 images)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'max_15_images'
  ) THEN
    ALTER TABLE public.wallpapers 
    ADD CONSTRAINT max_15_images 
    CHECK (array_length(images, 1) <= 15);
  END IF;
END $$;

-- Verify it worked
SELECT 
  'SUCCESS! Schema updated.' as status,
  COUNT(*) as total_posts,
  COUNT(images) as posts_with_images_array,
  COUNT(image_count) as posts_with_count
FROM public.wallpapers;

-- Show sample
SELECT id, title, image_url, images, image_count 
FROM public.wallpapers 
LIMIT 3;
