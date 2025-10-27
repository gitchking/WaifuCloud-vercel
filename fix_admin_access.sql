-- Fix admin access and RLS policies

-- Ensure profiles table allows reading admin status
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Make sure we can check admin status
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users only" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
CREATE POLICY "Enable update for users based on user_id" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Set a user as admin (replace with actual user ID)
-- You can get your user ID from the auth.users table or from your profile
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com' -- Replace with your email
  LIMIT 1
);

-- Alternative: Set admin by user_id directly if you know it
-- UPDATE public.profiles SET is_admin = true WHERE user_id = 'your-user-id-here';