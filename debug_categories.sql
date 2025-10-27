-- Debug categories table and permissions

-- 1. Check if categories table exists
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'categories';

-- 3. Check if table has RLS enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'categories';

-- 4. Test basic insert (this will show RLS errors if any)
-- Note: This is just for testing, remove after debugging
-- INSERT INTO public.categories (name, description, is_active) 
-- VALUES ('Test Category', 'Test Description', true);

-- 5. Check current user and admin status
-- SELECT auth.uid() as current_user_id;

-- 6. Check profiles table for admin users
SELECT user_id, is_admin 
FROM public.profiles 
WHERE is_admin = true
LIMIT 5;