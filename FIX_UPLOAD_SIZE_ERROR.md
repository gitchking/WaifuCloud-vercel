# Fix Upload Size Error

## Error
```
Upload failed: The object exceeded the maximum allowed size
```

## Cause
The image file is larger than the storage bucket's size limit in Supabase.

---

## Quick Fix - Option 1: Increase Storage Limits (Recommended)

### Step 1: Via SQL (Fastest)

Open Supabase Dashboard → SQL Editor and run:

```sql
-- Increase wallpapers bucket to 50MB
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE name = 'wallpapers';

-- Increase category-thumbnails to 10MB
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE name = 'category-thumbnails';

-- Verify
SELECT 
  name,
  ROUND(file_size_limit / 1024.0 / 1024.0, 2) as size_limit_mb
FROM storage.buckets
WHERE name IN ('wallpapers', 'category-thumbnails');
```

### Step 2: Via Dashboard (Alternative)

1. Go to Supabase Dashboard → Storage
2. Click on "wallpapers" bucket
3. Click "Settings" (gear icon)
4. Change "File size limit" to 50 MB
5. Click "Save"
6. Repeat for "category-thumbnails" bucket (set to 10 MB)

---

## Quick Fix - Option 2: Compress Images Before Upload

If you don't want to increase limits, compress images first:

### Online Tools
- https://tinypng.com/ (PNG/JPG compression)
- https://squoosh.app/ (Google's image compressor)
- https://compressor.io/ (Multi-format)

### Recommended Settings
- **Wallpapers**: Max 5-10MB, 1920x1080 or 2560x1440
- **Category Thumbnails**: Max 500KB, 400x400 or smaller

---

## Current Limits

**Default Supabase Limits:**
- Free tier: 1GB total storage
- File size: Usually 50MB default, but can be lower

**After Fix:**
- Wallpapers: 50MB per file
- Category thumbnails: 10MB per file

---

## Add Client-Side Validation

To prevent users from uploading huge files, the app already has validation:

**MultipleImageUpload.tsx:**
```typescript
// Current: 5MB limit
const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
```

**To increase to 10MB:**
```typescript
const invalidFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
```

---

## Check Current File Size

To see how large your images are:

**Windows:**
- Right-click image → Properties → Size

**Mac:**
- Right-click image → Get Info → Size

**Linux:**
- `ls -lh image.jpg`

---

## Recommended Image Sizes

### For Wallpapers
- **Resolution**: 1920x1080 (Full HD) or 2560x1440 (2K)
- **Format**: JPG (smaller) or PNG (higher quality)
- **File Size**: 1-5MB is ideal
- **Max**: 10MB

### For Category Thumbnails
- **Resolution**: 400x400 or 800x800
- **Format**: JPG or PNG
- **File Size**: 100-500KB is ideal
- **Max**: 2MB

---

## Troubleshooting

### Still Getting Error After SQL Fix?

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Wait 1-2 minutes** for Supabase to apply changes
3. **Try uploading again**

### Error: "Bucket not found"?

Create the buckets first:

```sql
-- Create wallpapers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('wallpapers', 'wallpapers', true, 52428800)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = 52428800;

-- Create category-thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('category-thumbnails', 'category-thumbnails', true, 10485760)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = 10485760;
```

### Compress Images Automatically?

Add image compression to the upload process (future enhancement):
- Use browser-image-compression library
- Compress on client before upload
- Maintain quality while reducing size

---

## Summary

**Problem:** Image too large for storage bucket
**Solution 1:** Increase bucket size limit (SQL above)
**Solution 2:** Compress images before upload
**Time:** 1 minute
**Result:** Uploads work! ✅

Run the SQL fix and try uploading again!
