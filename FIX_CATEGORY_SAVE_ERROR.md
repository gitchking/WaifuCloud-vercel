# Fix Category Save Error

## Error
```
Failed to save category: permission denied for table users
```

## Cause
Missing or incorrect Row Level Security (RLS) policies on the `categories` table.

---

## ⚡ INSTANT FIX (1 minute)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Click "New Query"

### Step 2: Run This SQL

Copy and paste this entire block:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

-- Create new comprehensive policies

-- Anyone can read
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT TO public USING (true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create categories"
ON categories FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update categories"
ON categories FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- Only admins can delete
CREATE POLICY "Only admins can delete categories"
ON categories FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Add profiles read policy if missing
CREATE POLICY IF NOT EXISTS "Anyone can view profiles" 
ON profiles FOR SELECT TO public USING (true);
```

### Step 3: Click **Run**

### Step 4: Try saving a category again - should work! ✅

---

## What This Does

Sets up proper permissions:

| Operation | Who Can Do It |
|-----------|---------------|
| **Read** (SELECT) | Everyone (public) |
| **Create** (INSERT) | Logged in users |
| **Update** (UPDATE) | Logged in users |
| **Delete** (DELETE) | Admins only |

---

## Verify You're Logged In

Check your authentication:

```sql
SELECT 
  auth.uid() as user_id,
  auth.email() as email;
```

Should show your user ID and email.

---

## Make Yourself Admin (If Needed)

If you need admin privileges:

```sql
UPDATE profiles
SET is_admin = true
WHERE user_id = auth.uid();
```

---

## Check Current Policies

To see what policies exist:

```sql
SELECT 
  policyname,
  CASE cmd
    WHEN 'SELECT' THEN 'Read'
    WHEN 'INSERT' THEN 'Create'
    WHEN 'UPDATE' THEN 'Update'
    WHEN 'DELETE' THEN 'Delete'
  END as operation
FROM pg_policies
WHERE tablename = 'categories';
```

---

## Alternative: Disable RLS (Not Recommended)

If you want to disable RLS entirely (less secure):

```sql
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

**Warning:** This allows anyone to modify categories!

---

## Troubleshooting

### Still Getting Error?

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Log out and log back in**
3. **Check you're authenticated**:
   ```sql
   SELECT auth.uid();
   ```
   Should return your user ID, not NULL

### Error: "profiles table not found"?

Create the profiles table first or check its name:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename LIKE '%profile%';
```

### Error: "relation does not exist"?

The table might be in a different schema:

```sql
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename IN ('categories', 'profiles', 'users');
```

---

## Complete Fix

For the most comprehensive fix, use:
- File: `fix_all_category_permissions.sql`
- Includes all policies + verification queries

---

## Summary

**Problem:** RLS blocking category save/update
**Solution:** Create proper RLS policies
**Time:** 1 minute
**Result:** Categories can be created/edited! ✅

Run the SQL above and try again!
