# Fix Category Creation for Regular Users

## Problem
Regular users cannot create categories because RLS policies restrict INSERT to admins only.

## Solution
Update RLS policies to allow all authenticated users to create categories, while keeping update/delete restricted to admins.

## Steps to Apply Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `allow_users_create_categories.sql`
5. Click "Run" or press Ctrl+Enter

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push --db-url "your-database-url"
```

### Option 3: Using psql
```bash
psql "your-database-connection-string" -f allow_users_create_categories.sql
```

## What This Fix Does
- ✅ Allows all authenticated users to INSERT new categories
- ✅ Keeps UPDATE restricted to admins only
- ✅ Keeps DELETE restricted to admins only
- ✅ Everyone can still SELECT/view categories
- ✅ Enables community-driven category creation

## Verification
After running the SQL, test by:
1. Log in as a regular (non-admin) user
2. Go to Upload page
3. Click "New Category" button
4. Fill in category details
5. Click "Create Category"
6. Should succeed without errors!
