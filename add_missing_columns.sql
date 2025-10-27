-- Complete database setup script
-- This adds all missing columns and creates the wallpapers table

-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Regular',
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['Regular']::TEXT[],
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Add unique constraint to username (separate from column creation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_username_key' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- 3. Create wallpapers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.wallpapers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  credit TEXT,
  is_nsfw BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles (nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);

-- 6. Update existing profiles to have default values
UPDATE public.profiles 
SET 
  role = COALESCE(role, 'Regular'),
  roles = COALESCE(roles, ARRAY['Regular']::TEXT[])
WHERE role IS NULL OR roles IS NULL OR roles = '{}';

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$;

-- 8. Add triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.wallpapers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.wallpapers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. RLS Policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. RLS Policies for wallpapers
DROP POLICY IF EXISTS "Wallpapers are viewable by everyone" ON public.wallpapers;
CREATE POLICY "Wallpapers are viewable by everyone"
  ON public.wallpapers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can upload wallpapers" ON public.wallpapers;
CREATE POLICY "Authenticated users can upload wallpapers"
  ON public.wallpapers FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can update own wallpapers" ON public.wallpapers;
CREATE POLICY "Users can update own wallpapers"
  ON public.wallpapers FOR UPDATE
  USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can delete own wallpapers" ON public.wallpapers;
CREATE POLICY "Users can delete own wallpapers"
  ON public.wallpapers FOR DELETE
  USING (auth.uid() = uploaded_by);

-- 11. Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('wallpapers', 'wallpapers', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 12. Storage policies for wallpapers
DROP POLICY IF EXISTS "Wallpapers are publicly accessible" ON storage.objects;
CREATE POLICY "Wallpapers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers');

DROP POLICY IF EXISTS "Authenticated users can upload wallpapers" ON storage.objects;
CREATE POLICY "Authenticated users can upload wallpapers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wallpapers' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own wallpapers" ON storage.objects;
CREATE POLICY "Users can update own wallpapers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'wallpapers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own wallpapers" ON storage.objects;
CREATE POLICY "Users can delete own wallpapers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wallpapers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 13. Storage policies for avatars
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );