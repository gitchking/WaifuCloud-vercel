# Fix: "relation public.favorites does not exist"

## The Problem

The delete account function is trying to delete from a `favorites` table that doesn't exist in your database.

## ✅ Solution (Choose One)

### Option 1: Update Function to Skip Missing Tables (Recommended)

This makes the function work regardless of which tables exist.

**Run this SQL:**

```sql
CREATE OR REPLACE FUNCTION delete_user_data(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;
  
  -- Delete wallpapers if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallpapers') THEN
    DELETE FROM public.wallpapers WHERE uploaded_by = user_id_to_delete;
  END IF;
  
  -- Delete favorites if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    DELETE FROM public.favorites WHERE user_id = user_id_to_delete;
  END IF;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;
```

**Result:** Delete account will work even without favorites table ✅

---

### Option 2: Create the Favorites Table

If you want to add favorites/bookmarks feature to your app.

**Run this SQL:**

```sql
-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wallpaper_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_wallpaper_id ON public.favorites(wallpaper_id);
```

**Result:** Favorites table created + Delete account works ✅

---

## Quick Fix Steps

### Step 1: Go to SQL Editor
```
https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz/sql
```

### Step 2: Choose Your Option

**If you don't need favorites:**
- Copy SQL from Option 1
- This updates the function to skip missing tables

**If you want favorites feature:**
- Copy SQL from Option 2
- This creates the favorites table

### Step 3: Run It
- Paste the SQL
- Click "Run"
- Should see "Success" ✅

### Step 4: Test Delete Account
- Go to `/profile`
- Click "Delete Account"
- Should work now! ✅

---

## Check What Tables You Have

Run this to see all your tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Common tables:
- ✅ `profiles` - User profiles
- ✅ `wallpapers` - Wallpaper uploads
- ✅ `categories` - Wallpaper categories
- ❓ `favorites` - User favorites (may not exist)

---

## Why This Happened

The delete function was written assuming all tables exist, but your database might not have a favorites table yet. This is normal if:

- You haven't implemented favorites feature yet
- You're using a different table name
- The table was never created

---

## Recommended Approach

**Use Option 1** (Update function to skip missing tables)

**Why:**
✅ Works immediately
✅ No table creation needed
✅ Future-proof (handles any missing tables)
✅ Simpler

**Then later:**
- Add favorites feature when you need it
- Function will automatically work with it

---

## Files Reference

- `delete_account_without_edge_function.sql` - Updated function (Option 1)
- `create_favorites_table.sql` - Create favorites table (Option 2)
- `check_tables.sql` - Check what tables exist

---

## Verify It Works

After applying the fix:

1. Go to `/profile`
2. Click "Delete Account"
3. Confirm twice
4. Should see:
   - ✅ "Deleting account data..."
   - ✅ "Account deleted successfully"
   - ✅ Logged out
   - ✅ No errors!

---

## Summary

**Problem:** Function tried to delete from non-existent favorites table
**Solution:** Update function to check if table exists first
**Result:** Delete account works perfectly ✅

Just run the SQL from Option 1 and you're done! 🎉
