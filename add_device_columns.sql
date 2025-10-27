-- Add device compatibility columns to wallpapers table
ALTER TABLE public.wallpapers 
ADD COLUMN IF NOT EXISTS suitable_for_desktop BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS suitable_for_mobile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_desktop ON public.wallpapers (suitable_for_desktop);
CREATE INDEX IF NOT EXISTS idx_wallpapers_mobile ON public.wallpapers (suitable_for_mobile);
CREATE INDEX IF NOT EXISTS idx_wallpapers_dimensions ON public.wallpapers (width, height);

-- Update existing wallpapers based on orientation
-- Vertical wallpapers are better for mobile, horizontal for desktop
UPDATE public.wallpapers 
SET 
  suitable_for_desktop = CASE 
    WHEN orientation = 'vertical' THEN false 
    ELSE true 
  END,
  suitable_for_mobile = CASE 
    WHEN orientation = 'horizontal' THEN false 
    ELSE true 
  END
WHERE suitable_for_desktop IS NULL OR suitable_for_mobile IS NULL;