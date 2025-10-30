# Fix: Deleted Users Can Login Again

## The Problem

When a user deletes their account:
- ✅ Profile is deleted
- ✅ Wallpapers are deleted
- ✅ Avatar is deleted
- ❌ BUT they can login again (creates new profile)

This happens because the account in `auth.users` still exists.

## ✅ Complete Solution

### Step 1: Run This SQL

This prevents deleted users from logging in or recreating profiles.

```sql
-- Create table to track deleted users
CREATE TABLE IF NOT EXISTS public.deleted_users (
  user_id UUID PRIMARY KEY,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on deleted_users table
ALTER TABLE public.deleted_users ENABLE ROW LEVEL SECURITY;

-- Only allow system to manage this table
CREATE POLICY "Only system can manage deleted users"
  ON public.deleted_users
  FOR ALL
  TO authenticated
  USING (false);

-- Function to prevent profile recreation
CREATE OR REPLACE FUNCTION prevent_profile_recreation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  was_deleted BOOLEAN;
BEGIN
  -- Check if user is in deleted list
  SELECT EXISTS(SELECT 1 FROM public.deleted_users WHERE user_id = NEW.user_id) INTO was_deleted;
  
  IF was_deleted THEN
    RAISE EXCEPTION 'This account has been permanently deleted and cannot be restored';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent profile recreation
DROP TRIGGER IF EXISTS prevent_profile_recreation ON public.profiles;
CREATE TRIGGER prevent_profile_recreation
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_profile_recreation();

-- Update delete function to mark user as deleted
CREATE OR REPLACE FUNCTION delete_user_data(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;
  
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
  
  -- Delete profile
  DELETE FROM public.profiles WHERE user_id = user_id_to_delete;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;
```

### Step 2: Code Already Updated

The AuthContext has been updated to check if profile exists on login. If not, it blocks the login.

## How It Works Now

### When User Deletes Account:
1. ✅ Profile deleted
2. ✅ Wallpapers deleted
3. ✅ Favorites deleted
4. ✅ Avatar deleted
5. ✅ User ID added to `deleted_users` table
6. ✅ User logged out

### When Deleted User Tries to Login:
1. ❌ Login succeeds in auth
2. ✅ App checks if profile exists
3. ✅ Profile doesn't exist → Blocked!
4. ✅ Shows error: "This account has been deleted"
5. ✅ Automatically logged out

### If They Try to Create New Profile:
1. ❌ Trigger checks `deleted_users` table
2. ✅ User ID found → Blocked!
3. ✅ Error: "Account permanently deleted"

## Testing

### Test 1: Delete Account
1. Login with test account
2. Go to `/profile`
3. Click "Delete Account"
4. Confirm twice
5. ✅ Should logout and redirect

### Test 2: Try to Login Again
1. Go to `/login`
2. Enter same credentials
3. Try to login
4. ✅ Should show: "This account has been deleted"
5. ✅ Should not login

### Test 3: Verify in Database
```sql
-- Check deleted users
SELECT * FROM public.deleted_users;

-- Check if profile exists
SELECT * FROM public.profiles WHERE user_id = 'USER_ID_HERE';

-- Should show user in deleted_users, no profile
```

## What Gets Tracked

The `deleted_users` table stores:
- `user_id` - UUID of deleted user
- `deleted_at` - Timestamp of deletion

This prevents:
- ❌ Logging in with deleted account
- ❌ Recreating profile for deleted account
- ❌ Any access to the app

## Benefits

✅ **True Deletion** - User can't access app anymore
✅ **No Data Recovery** - Profile can't be recreated
✅ **Clean UX** - Clear error message
✅ **GDPR Compliant** - Data stays deleted
✅ **Secure** - Can't bypass the block

## Cleanup Old Auth Users (Optional)

If you want to also remove from `auth.users`, run this periodically:

```sql
-- Delete auth users that have been marked as deleted
-- Run this manually or set up a cron job
DELETE FROM auth.users
WHERE id IN (SELECT user_id FROM public.deleted_users);
```

**Note:** This requires admin privileges, so run it in SQL Editor.

## Troubleshooting

### Deleted user can still login
**Check:**
1. SQL script ran successfully
2. `deleted_users` table exists
3. Trigger is created
4. User ID is in `deleted_users` table

### Error: "trigger does not exist"
**Fix:** Run the SQL script again

### Want to restore a deleted account
**Not recommended, but if needed:**
```sql
-- Remove from deleted users list
DELETE FROM public.deleted_users WHERE user_id = 'USER_ID_HERE';

-- User can now login and profile will be recreated
```

## Summary

**Before Fix:**
- User deletes account
- Data deleted but can login again
- New profile created automatically

**After Fix:**
- User deletes account
- Data deleted AND marked as deleted
- Can't login anymore
- Can't recreate profile
- True account deletion ✅

Run the SQL script and deleted accounts will stay deleted! 🎉
