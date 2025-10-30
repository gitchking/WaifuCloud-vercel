# Fix Category Delete Permission Error

## Error
```
403 Forbidden
permission denied for table users
code: "42501"
```

## Cause
Row Level Security (RLS) policies on the `categories` table don't allow deletion.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" (left sidebar)
4. Click "New Query"

### Step 2: Run This SQL

Copy and paste this entire block:

```sql
-- Fix delete permission for categories
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

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

-- Verify it worked
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'categories'
AND cmd = 'DELETE';
```

Click **Run**

### Step 3: Test
1. Go back to your Admin page
2. Try deleting a category
3. Should work now! ✅

---

## What This Does

Creates a Row Level Security (RLS) policy that:
- ✅ Allows admins to delete categories
- ✅ Checks if user has `is_admin = true` in profiles table
- ✅ Blocks non-admins from deleting

---

## Complete Fix (All Permissions)

For a complete fix of all category permissions, run `fix_categories_delete_rls.sql`:

```sql
-- This sets up all RLS policies:
-- SELECT: Everyone can read
-- INSERT: Authenticated users can create
-- UPDATE: Admins can update
-- DELETE: Admins can delete
```

---

## Verify Your Admin Status

To check if you're an admin:

```sql
SELECT 
  user_id,
  is_admin,
  username,
  full_name
FROM profiles
WHERE user_id = auth.uid();
```

Should show `is_admin: true`

If not, make yourself admin:

```sql
UPDATE profiles
SET is_admin = true
WHERE user_id = auth.uid();
```

---

## After Fix

Once the RLS policy is created:
- ✅ Admins can delete categories
- ✅ No more 403 errors
- ✅ Smart delete logic from code will work
- ✅ Can use SQL function or UI

---

## Alternative: Use SQL Function

If you still get errors, use the SQL function directly:

```sql
SELECT delete_category_safe('CategoryName');
```

This bypasses RLS with `SECURITY DEFINER`.

---

## Summary

**Problem:** RLS policy blocking category deletion
**Solution:** Create admin-only delete policy
**Time:** 2 minutes
**Result:** Categories can be deleted! ✅

Run the SQL above and try again!
