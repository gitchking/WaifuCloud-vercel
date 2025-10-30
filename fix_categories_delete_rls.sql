-- Fix Categories Delete Permission (RLS Policy)
-- Run this in Supabase SQL Editor

-- The error "permission denied for table users" means RLS policies are blocking deletion
-- This will fix the delete permission for categories

-- Step 1: Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'categories';

-- Step 2: Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;
DROP POLICY IF EXISTS "Allow admins to delete categories" ON categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON categories;

-- Step 3: Create proper delete policy for admins
CREATE POLICY "Admins can delete categories"
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

-- Step 4: Verify the policy was created
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'categories'
AND cmd = 'DELETE';

-- Step 5: Also ensure proper SELECT, INSERT, UPDATE policies exist

-- Allow everyone to read active categories
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users"
ON categories
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert categories
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
CREATE POLICY "Enable insert for authenticated users"
ON categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins to update categories
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
ON categories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Step 6: Verify all policies
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as operation
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Categories RLS policies updated successfully!';
  RAISE NOTICE 'Admins can now delete categories.';
END $$;
