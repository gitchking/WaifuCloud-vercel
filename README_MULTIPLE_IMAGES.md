# Multiple Images Feature - Complete Guide

## 🚀 Quick Start

### 1. Apply Database Migration (Required!)

**Copy and run this in Supabase SQL Editor:**

```sql
-- Add columns for multiple images
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
```

### 2. Test Upload

1. Go to `/upload`
2. Upload 2-3 images
3. Submit the form
4. Should work! ✅

---

## 📁 Files Overview

### Migration Files
- **`quick_migration.sql`** - Fastest way to apply schema (recommended)
- **`apply_multiple_images_schema.sql`** - Complete migration with functions
- **`check_schema.sql`** - Verify if migration is needed

### Documentation
- **`FIX_UPLOAD_ERROR.md`** - Step-by-step fix guide (start here!)
- **`APPLY_SCHEMA_UPDATE.md`** - Detailed migration instructions
- **`TEST_MULTIPLE_IMAGES.md`** - Testing checklist
- **`MULTIPLE_IMAGES_WAIFU_UPDATE.md`** - Complete changelog

### Code Files (Already Updated)
- ✅ `src/pages/Upload.tsx` - Multiple image upload
- ✅ `src/pages/Dashboard.tsx` - Shows image count
- ✅ `src/pages/Watch.tsx` - Image slider
- ✅ `src/components/WallpaperCard.tsx` - Image count badge
- ✅ `src/components/MultipleImageUpload.tsx` - Image selector
- ✅ `src/components/ImageSlider.tsx` - Image carousel
- ✅ `src/types/wallpaper.ts` - Type definitions

---

## ✨ Features

### Upload Page
- Select up to 15 images per post
- Drag & drop or click to upload
- Preview all images before upload
- Shows image count in preview
- All "wallpaper" text changed to "waifu"

### Watch Page
- Image slider with navigation arrows
- Thumbnail navigation below main image
- Image counter (e.g., "2 / 5")
- Download all images button
- Keyboard navigation support

### Gallery & Dashboard
- Image count badge on cards
- Shows "{count} images" indicator
- Backward compatible with single images
- All terminology updated to "waifu"

---

## 🔧 Database Schema

### New Columns

```sql
images       TEXT[]    -- Array of image URLs
image_count  INTEGER   -- Number of images (for quick queries)
```

### Backward Compatibility

- `image_url` column still exists (stores first image)
- Existing posts automatically migrated to array format
- Single image posts work exactly as before
- No breaking changes!

---

## 📝 Usage Examples

### Upload Single Image (Works as before)
```typescript
// User selects 1 image
// Database stores:
{
  image_url: "url1.jpg",
  images: ["url1.jpg"],
  image_count: 1
}
```

### Upload Multiple Images (New feature)
```typescript
// User selects 3 images
// Database stores:
{
  image_url: "url1.jpg",      // First image
  images: ["url1.jpg", "url2.jpg", "url3.jpg"],
  image_count: 3
}
```

---

## 🧪 Testing Checklist

After applying migration:

- [ ] Run `check_schema.sql` - verify columns exist
- [ ] Upload 1 image - should work as before
- [ ] Upload 3 images - should show in slider
- [ ] View old posts - should display normally
- [ ] View new multi-image posts - should show slider
- [ ] Download multi-image post - downloads all
- [ ] Check dashboard - shows image count badge
- [ ] Check gallery - shows image count badge
- [ ] All text says "waifu" not "wallpaper"

---

## 🐛 Troubleshooting

### Upload fails with "column does not exist"
→ Run the migration: `quick_migration.sql`

### Upload fails with "cannot insert NULL"
→ Run this fix:
```sql
UPDATE wallpapers 
SET images = ARRAY[image_url]::TEXT[], image_count = 1
WHERE images IS NULL;
```

### Old posts don't show images array
→ Run the migration again, it will update existing data

### Constraint error "max_15_images already exists"
→ Run this first:
```sql
ALTER TABLE wallpapers DROP CONSTRAINT IF EXISTS max_15_images;
```

---

## 📊 Migration Status Check

Run this to check if migration is complete:

```sql
SELECT 
  CASE 
    WHEN COUNT(*) = COUNT(images) AND COUNT(*) = COUNT(image_count)
    THEN '✅ Migration Complete'
    ELSE '❌ Migration Needed'
  END as status,
  COUNT(*) as total_posts,
  COUNT(images) as posts_with_images,
  COUNT(image_count) as posts_with_count
FROM wallpapers;
```

---

## 🎯 Next Steps

1. **Apply Migration** - Run `quick_migration.sql` in Supabase
2. **Test Upload** - Try uploading multiple images
3. **Verify Display** - Check watch page shows slider
4. **Test Download** - Download multi-image post
5. **Check Terminology** - Verify all text says "waifu"

---

## 📚 Additional Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **SQL Editor**: Dashboard → SQL Editor (left sidebar)
- **Database**: Dashboard → Database → Tables

---

## ✅ Success Criteria

Your setup is complete when:
- ✅ Can upload 1-15 images per post
- ✅ Multiple images display in slider
- ✅ Image count shows on cards
- ✅ Download works for all images
- ✅ All text says "waifu" not "wallpaper"
- ✅ Old posts still work normally
- ✅ No console errors

---

## 💡 Tips

- Start with `quick_migration.sql` for fastest setup
- Use `check_schema.sql` to verify before and after
- Test with 2-3 images first, then try more
- The migration is safe and reversible
- All changes are backward compatible

---

## 🆘 Need Help?

If you're stuck:
1. Check `FIX_UPLOAD_ERROR.md` for detailed steps
2. Run `check_schema.sql` and share results
3. Check browser console for errors
4. Share the error message from Supabase

The feature is fully implemented in code - you just need to apply the database migration!
