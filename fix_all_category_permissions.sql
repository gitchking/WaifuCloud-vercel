-- Fix ALL Category Permissions (Complete RLS Setup)
-- Run this in Supabase SQL Editor

-- This fixes "permission denied for table users" errors
-- for INSERT, UPDATE, and DELETE operations on categories

-- Step 1: Drop all existing category policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to create categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;

-- Step 2: Create comprehensive RLS policies

-- SELECT: Everyone can read categories (public access)
CREATE POLICY "Anyone can view categories"
ON categories
FOR SELECT
TO public
USING (true);

-- INSERT: Authenticated users can create categories
CREATE POLICY "Authenticated users can create categories"
ON categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Authenticated users can update categories
-- (You can restrict to admins only if needed)
CREATE POLICY "Authenticated users can update categories"
ON categories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Only admins can delete categories
CREATE POLICY "Only admins can delete categories"
ON categories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Step 3: Verify all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE cmd
    WHEN 'SELECT' THEN 'Read'
    WHEN 'INSERT' THEN 'Create'
    WHEN 'UPDATE' THEN 'Update'
    WHEN 'DELETE' THEN 'Delete'
  END as operation,
  CASE 
    WHEN policyname LIKE '%admin%' THEN 'Admins only'
    WHEN policyname LIKE '%authenticated%' THEN 'Logged in users'
    WHEN policyname LIKE '%Anyone%' THEN 'Everyone'
    ELSE 'Custom'
  END as who_can_access
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd;

-- Step 4: Ensure RLS is enabled on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 5: Check if profiles table has proper access
-- (The error mentions "users" table, which might be profiles)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- If profiles has no SELECT policy, add one
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND cmd = 'SELECT'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT TO public USING (true)';
    RAISE NOTICE 'Created SELECT policy for profiles table';
  END IF;
END $$;

-- Step 6: Verify your admin status
SELECT 
  user_id,
  is_admin,
  username,
  email,
  full_name
FROM profiles
WHERE user_id = auth.uid();

-- If you're not admin, make yourself admin:
-- UPDATE profiles SET is_admin = true WHERE user_id = auth.uid();

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ All category permissions fixed!';
  RAISE NOTICE '- Anyone can READ categories';
  RAISE NOTICE '- Authenticated users can CREATE categories';
  RAISE NOTICE '- Authenticated users can UPDATE categories';
  RAISE NOTICE '- Admins can DELETE categories';
  RAISE NOTICE '';
  RAISE NOTICE 'Try creating/editing a category now!';
END $$;
