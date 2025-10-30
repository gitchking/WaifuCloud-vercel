-- Alternative: Delete Account Without Edge Function
-- This uses database functions and handles missing tables gracefully

-- Step 1: Create a function to delete user data
CREATE OR REPLACE FUNCTION delete_user_data(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to delete their own data
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;

  -- Delete user's wallpapers (if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallpapers') THEN
    DELETE FROM public.wallpapers WHERE uploaded_by = user_id_to_delete;
  END IF;
  
  -- Delete user's favorites (if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    DELETE FROM public.favorites WHERE user_id = user_id_to_delete;
  END IF;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
  
  -- Note: Avatar deletion from storage needs to be handled separately
  -- User deletion from auth.users needs to be done via Supabase client
END;
$$;

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

-- Step 3: Verify the function was created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'delete_user_data';
