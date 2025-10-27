-- Complete schema setup for new Supabase project
-- Apply this in your Supabase SQL Editor

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'Regular',
  roles TEXT[] DEFAULT ARRAY['Regular']::TEXT[],
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create wallpapers table
CREATE TABLE public.wallpapers (
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

-- Enable RLS
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;

-- Wallpapers policies
CREATE POLICY "Wallpapers are viewable by everyone"
  ON public.wallpapers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload wallpapers"
  ON public.wallpapers FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own wallpapers"
  ON public.wallpapers FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own wallpapers"
  ON public.wallpapers FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Create storage bucket for wallpapers
INSERT INTO storage.buckets (id, name, public)
VALUES ('wallpapers', 'wallpapers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for wallpapers
CREATE POLICY "Wallpapers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers');

CREATE POLICY "Authenticated users can upload wallpapers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wallpapers' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own wallpapers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'wallpapers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own wallpapers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wallpapers' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create updated_at trigger function
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

-- Add triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.wallpapers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles (nickname);