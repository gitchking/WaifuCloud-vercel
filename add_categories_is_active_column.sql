-- Add is_active column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance on active categories
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories (is_active);

-- Update existing categories to be active by default
UPDATE public.categories 
SET is_active = true 
WHERE is_active IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;