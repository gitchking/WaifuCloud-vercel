-- Script to add orientation column to wallpapers table
-- This can be run directly in the Supabase SQL editor if the migration isn't working

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

-- Refresh the schema cache
-- Note: In Supabase, you might need to refresh the schema cache manually
-- This can be done by going to the Table Editor and clicking "Refresh"