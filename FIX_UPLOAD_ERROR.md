# Fix Upload Error - Apply Database Schema

## Problem
Upload is failing because the database doesn't have the `images` and `image_count` columns yet.

## Solution
Apply the database migration to add support for multiple images.

---

## Step-by-Step Fix

### Step 1: Check Current Schema

1. Open **Supabase Dashboard** → Your Project
2. Go to **SQL Editor** (left sidebar)
3. Create a new query
4. Copy and paste from `check_schema.sql`:

```sql
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'wallpapers' 
  AND column_name IN ('images', 'image_count', 'image_url')
ORDER BY column_name;
```

5. Click **Run**

**Expected Result:**
- If you see only `image_url` → You need to apply the migration ❌
- If you see `images`, `image_count`, and `image_url` → Schema is ready ✅

---

### Step 2: Apply the Migration

1. In **Supabase SQL Editor**, create a new query
2. Open the file `apply_multiple_images_schema.sql`
3. Copy **ALL** the content (it's a long file)
4. Paste into the SQL Editor
5. Click **Run**

**Wait for completion** - should take 5-10 seconds

---

### Step 3: Verify Migration Success

Run this verification query:

```sql
-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wallpapers' 
  AND column_name IN ('images', 'image_count');

-- Check sample data
SELECT id, title, images, image_count 
FROM wallpapers 
LIMIT 3;
```

**Expected Results:**
- ✅ Two columns: `images` (ARRAY) and `image_count` (integer)
- ✅ Existing posts have `images` array with at least one URL
- ✅ `image_count` is 1 for existing posts

---

### Step 4: Test Upload

1. Go to your app: `/upload`
2. Fill in the form:
   - Title: "Test Multiple Images"
   - Category: Any category
   - Upload 2-3 images
3. Click "Upload Waifu"

**Expected Result:**
- ✅ Upload succeeds
- ✅ Redirects to home page
- ✅ Success toast appears
- ✅ Post appears in gallery

---

## Quick Copy-Paste Migration

If you want the fastest fix, just copy this entire block and run it in Supabase SQL Editor:

```sql
-- Add columns
ALTER TABLE public.wallpapers 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 1;

-- Migrate existing data
UPDATE public.wallpapers 
SET images = ARRAY[image_url]::TEXT[],
    image_count = 1
WHERE images IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_wallpapers_image_count 
ON public.wallpapers(image_count);

-- Add constraint
DO $$ 
BEGIN
  ALTER TABLE public.wallpapers 
  ADD CONSTRAINT max_15_images 
  CHECK (array_length(images, 1) <= 15);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Verify
SELECT 'Migration complete!' as status,
       COUNT(*) as total_posts,
       COUNT(images) as posts_with_images
FROM public.wallpapers;
```

---

## Troubleshooting

### Error: "column already exists"
✅ This is fine! It means the column was already added. Continue to next step.

### Error: "constraint already exists"
Run this first:
```sql
ALTER TABLE public.wallpapers DROP CONSTRAINT IF EXISTS max_15_images;
```
Then run the migration again.

### Upload still fails after migration
1. Check browser console for errors
2. Verify the columns exist:
   ```sql
   \d wallpapers
   ```
3. Check if data was migrated:
   ```sql
   SELECT images, image_count FROM wallpapers LIMIT 1;
   ```

### "Cannot insert NULL into column images"
Run this to fix existing data:
```sql
UPDATE public.wallpapers 
SET images = ARRAY[image_url]::TEXT[],
    image_count = 1
WHERE images IS NULL OR array_length(images, 1) IS NULL;
```

---

## What Changed in the Code

The Upload page now:
1. Accepts multiple images (up to 15)
2. Uploads each image sequentially
3. Stores all URLs in `images` array
4. Sets `image_count` to the number of images
5. Keeps `image_url` as the first image (backward compatible)

---

## After Migration

Once the schema is updated, you can:
- ✅ Upload 1-15 images per post
- ✅ View multiple images in a slider
- ✅ Download all images at once
- ✅ See image count badges on cards
- ✅ All existing posts still work normally

---

## Files Reference

- **Migration**: `apply_multiple_images_schema.sql` (full migration)
- **Check**: `check_schema.sql` (verify schema)
- **Guide**: `APPLY_SCHEMA_UPDATE.md` (detailed instructions)
- **Testing**: `TEST_MULTIPLE_IMAGES.md` (test checklist)

---

## Need Help?

If you're still having issues:
1. Share the error message from browser console
2. Share the error from Supabase SQL Editor
3. Run `check_schema.sql` and share the results

The migration is safe and backward compatible - it won't break existing posts!
