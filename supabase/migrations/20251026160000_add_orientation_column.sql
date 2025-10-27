-- Add orientation column to wallpapers table
ALTER TABLE public.wallpapers 
ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT 'horizontal';

-- Add constraint to ensure valid orientation values
ALTER TABLE public.wallpapers 
ADD CONSTRAINT valid_orientation 
CHECK (orientation IN ('horizontal', 'vertical'));

-- Update existing wallpapers to have default orientation
UPDATE public.wallpapers 
SET orientation = 'horizontal' 
WHERE orientation IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_orientation 
ON public.wallpapers (orientation);