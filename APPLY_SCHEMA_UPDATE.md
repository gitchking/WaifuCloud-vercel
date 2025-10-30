# Apply Multiple Images Schema Update

## Quick Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Migration**
   - Open the file: `apply_multiple_images_schema.sql`
   - Copy ALL the content
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify Success**
   - Check the output at the bottom
   - Should see verification results showing:
     - `images` column (TEXT[])
     - `image_count` column (INTEGER)
     - Sample data with arrays

### Option 2: Using Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push

# Or apply the SQL file directly
psql $DATABASE_URL -f apply_multiple_images_schema.sql
```

## What This Migration Does

1. ✅ Adds `images` column (TEXT[] array) to store multiple image URLs
2. ✅ Adds `image_count` column (INTEGER) for quick reference
3. ✅ Migrates existing posts to use array format (backward compatible)
4. ✅ Creates index for better performance
5. ✅ Adds constraint to limit maximum 15 images per post
6. ✅ Creates helper functions for adding/removing images
7. ✅ Grants proper permissions to authenticated users

## Verification

After running the migration, verify it worked:

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wallpapers' 
AND column_name IN ('images', 'image_count');

-- Check existing data was migrated
SELECT id, title, image_url, images, image_count 
FROM wallpapers 
LIMIT 5;
```

Expected results:
- `images` should be an array containing at least `image_url`
- `image_count` should be 1 for existing posts
- No NULL values in these columns

## Troubleshooting

### Error: "column already exists"
This is fine! The migration uses `IF NOT EXISTS` checks. It will skip existing columns.

### Error: "constraint already exists"
The migration drops the constraint first if it exists, then recreates it. If you still get this error, run:
```sql
ALTER TABLE public.wallpapers DROP CONSTRAINT IF EXISTS max_15_images;
```
Then run the migration again.

### Error: "function already exists"
The migration uses `CREATE OR REPLACE FUNCTION`, so this shouldn't happen. If it does:
```sql
DROP FUNCTION IF EXISTS add_image_to_wallpaper(UUID, TEXT);
DROP FUNCTION IF EXISTS remove_image_from_wallpaper(UUID, TEXT);
```
Then run the migration again.

### Existing data not migrated
If existing posts don't have the `images` array populated, run:
```sql
UPDATE public.wallpapers 
SET images = ARRAY[image_url]::TEXT[],
    image_count = 1
WHERE images IS NULL OR array_length(images, 1) IS NULL;
```

## Testing After Migration

1. **Test Upload**
   - Go to `/upload`
   - Try uploading 1 image (should work as before)
   - Try uploading 3 images (should work with new feature)

2. **Test Existing Posts**
   - Go to `/wallpapers`
   - Click on an old post
   - Should display normally (backward compatible)

3. **Test New Posts**
   - Upload a post with multiple images
   - View it on the watch page
   - Should see image slider

## Rollback (If Needed)

If something goes wrong and you need to rollback:

```sql
-- Remove the new columns
ALTER TABLE public.wallpapers DROP COLUMN IF EXISTS images;
ALTER TABLE public.wallpapers DROP COLUMN IF EXISTS image_count;

-- Drop the functions
DROP FUNCTION IF EXISTS add_image_to_wallpaper(UUID, TEXT);
DROP FUNCTION IF EXISTS remove_image_from_wallpaper(UUID, TEXT);

-- Drop the index
DROP INDEX IF EXISTS idx_wallpapers_image_count;
```

## Next Steps

After successfully applying the schema:

1. ✅ Test uploading single image (backward compatibility)
2. ✅ Test uploading multiple images (new feature)
3. ✅ Test viewing posts with multiple images
4. ✅ Test downloading multiple images
5. ✅ Verify all existing posts still work

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Make sure you have proper permissions
4. Check the browser console for frontend errors

The migration is designed to be safe and backward compatible. All existing posts will continue to work normally.
