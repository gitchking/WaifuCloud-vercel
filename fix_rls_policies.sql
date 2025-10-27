-- Fix RLS policies for profiles table to allow proper profile creation

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies that work properly
CREATE POLICY "Enable read access for all users" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = user_id);