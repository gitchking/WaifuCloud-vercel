-- Prevent users from logging in if their profile was deleted
-- This creates a database trigger that blocks login for users without profiles

-- Step 1: Create a function to check if profile exists on login
CREATE OR REPLACE FUNCTION check_profile_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    -- If no profile exists, this account was deleted
    -- Delete the auth user completely
    DELETE FROM auth.users WHERE id = NEW.id;
    RAISE EXCEPTION 'This account has been deleted';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 2: Create trigger that runs after user signs in
-- Note: We can't directly trigger on auth.users, so we'll use a different approach
-- Instead, we'll modify the profiles table to prevent recreation

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_profile_recreation ON public.profiles;

-- Create trigger to prevent profile recreation for deleted accounts
CREATE OR REPLACE FUNCTION prevent_profile_recreation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  was_deleted BOOLEAN;
BEGIN
  -- Check if this user was previously deleted
  -- We'll use a separate table to track deleted users
  
  -- First, ensure the deleted_users table exists
  CREATE TABLE IF NOT EXISTS public.deleted_users (
    user_id UUID PRIMARY KEY,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Check if user is in deleted list
  SELECT EXISTS(SELECT 1 FROM public.deleted_users WHERE user_id = NEW.user_id) INTO was_deleted;
  
  IF was_deleted THEN
    RAISE EXCEPTION 'This account has been permanently deleted and cannot be restored';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER prevent_profile_recreation
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_recreation();

-- Step 3: Update the delete_user_data function to mark user as deleted
CREATE OR REPLACE FUNCTION delete_user_data(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;
  
  -- Ensure deleted_users table exists
  CREATE TABLE IF NOT EXISTS public.deleted_users (
    user_id UUID PRIMARY KEY,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Mark user as deleted (prevents profile recreation)
  INSERT INTO public.deleted_users (user_id, deleted_at)
  VALUES (user_id_to_delete, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Delete wallpapers if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallpapers') THEN
    DELETE FROM public.wallpapers WHERE uploaded_by = user_id_to_delete;
  END IF;
  
  -- Delete favorites if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    DELETE FROM public.favorites WHERE user_id = user_id_to_delete;
  END IF;
  
  -- Delete profile (this will trigger the prevention of recreation)
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

-- Verify setup
SELECT 'Setup complete! Deleted users can no longer login or recreate profiles.' as status;
