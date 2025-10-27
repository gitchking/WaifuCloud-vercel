-- Fix categories table updated_at field issue
-- Run this script in Supabase SQL Editor

-- 1. First, let's check if there are any triggers on categories table
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'categories';

-- 2. Drop any existing triggers that might be causing issues
DROP TRIGGER IF EXISTS handle_updated_at ON public.categories;
DROP TRIGGER IF EXISTS set_updated_at ON public.categories;

-- 3. Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Add updated_at column if it doesn't exist
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 5. Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create the trigger for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Test insert to make sure it works
-- INSERT INTO public.categories (name, description, is_active) 
-- VALUES ('Test Category Fix', 'Testing updated_at fix', true);

-- 8. Verify the fix
SELECT 'Categories table structure' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;