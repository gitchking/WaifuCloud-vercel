-- Ensure device compatibility columns exist and are populated
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallpapers' AND column_name = 'suitable_for_desktop') THEN
        ALTER TABLE public.wallpapers ADD COLUMN suitable_for_desktop BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallpapers' AND column_name = 'suitable_for_mobile') THEN
        ALTER TABLE public.wallpapers ADD COLUMN suitable_for_mobile BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing wallpapers based on orientation if columns are empty
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_desktop ON public.wallpapers (suitable_for_desktop);
CREATE INDEX IF NOT EXISTS idx_wallpapers_mobile ON public.wallpapers (suitable_for_mobile);