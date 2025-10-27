-- Fix RLS policies for categories table
-- Drop existing policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;

-- Create new policies that work
CREATE POLICY "Enable read access for all users" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for admins only" 
  ON public.categories FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Enable update for admins only" 
  ON public.categories FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Enable delete for admins only" 
  ON public.categories FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Verify categories are visible
SELECT id, name, description, is_active, created_at FROM public.categories;