-- Add roles column to profiles table
-- This migration adds a roles column (plural) to store user roles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['Regular']::TEXT[];

-- Add index for roles field for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN (roles);

-- Update existing profiles to have default roles array
UPDATE public.profiles 
SET roles = ARRAY['Regular']::TEXT[]
WHERE roles IS NULL OR roles = '{}';

-- If you had a singular 'role' column and want to migrate data:
-- Uncomment the following lines if you want to migrate from role to roles
-- UPDATE public.profiles 
-- SET roles = ARRAY[COALESCE(role, 'Regular')]::TEXT[]
-- WHERE role IS NOT NULL;

-- Optional: Drop the old singular role column if you want to use roles instead
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
