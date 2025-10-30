# Admin Panel - Multiple Images Support

## Summary
Updated the Admin panel to support uploading multiple images per post (up to 15 images), matching the functionality of the regular Upload page.

## Changes Made

### Admin Page (`src/pages/Admin.tsx`)

#### 1. State Management
**Before:**
```typescript
const [image, setImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
```

**After:**
```typescript
// Multiple images support
const [images, setImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
```

#### 2. Component Import
Added:
```typescript
import { MultipleImageUpload } from "@/components/MultipleImageUpload";
```

#### 3. Upload Logic
**Before:** Single image upload
```typescript
// Upload single image
const formData = new FormData();
formData.append("file", image);
// ... upload logic
```

**After:** Multiple images upload
```typescript
// Upload all images
const imageUrls: string[] = [];

for (let i = 0; i < images.length; i++) {
  const formData = new FormData();
  formData.append("file", images[i]);
  // ... upload each image
  imageUrls.push(uploadResult.url);
}

// Insert with multiple images
await supabase.from("wallpapers").insert({
  image_url: imageUrls[0],      // First image (backward compatible)
  images: imageUrls,             // All images array
  image_count: imageUrls.length, // Count
  // ... other fields
});
```

#### 4. Form UI
**Before:** Single file input
```typescript
<Input
  type="file"
  accept="image/*"
  onChange={handleImageChange}
  required
/>
```

**After:** Multiple image upload component
```typescript
<MultipleImageUpload
  images={images}
  imagePreviews={imagePreviews}
  onImagesChange={(newImages, newPreviews) => {
    setImages(newImages);
    setImagePreviews(newPreviews);
  }}
  maxImages={15}
/>
```

#### 5. Preview Updates
- Shows first image with "+X more" badge
- Displays image count on card preview
- Updated all text from "Wallpaper" to "Waifu"

## Features

### Admin Upload Tab
- ✅ Select up to 15 images per post
- ✅ Drag & drop or click to upload
- ✅ Preview all images in grid
- ✅ Shows image count indicator
- ✅ Sequential upload of all images
- ✅ Stores all URLs in database

### Preview Section
- ✅ Shows first image with count badge
- ✅ Displays orientation preview
- ✅ Shows card preview with image count
- ✅ Real-time preview updates

### Database Integration
- ✅ Stores `images` array with all URLs
- ✅ Sets `image_count` to number of images
- ✅ Keeps `image_url` as first image (backward compatible)
- ✅ All fields properly populated

## Testing Checklist

### Admin Panel Tests
- [ ] Navigate to `/admin` (requires admin privileges)
- [ ] Go to "Upload Waifus" tab
- [ ] Upload 1 image - should work as before
- [ ] Upload 3-5 images - should show in grid
- [ ] Try uploading more than 15 - should show error
- [ ] Check preview shows image count
- [ ] Submit form - should upload all images
- [ ] Verify success message
- [ ] Check post appears in gallery with image count badge

### Database Verification
After admin upload, check database:
```sql
SELECT 
  id,
  title,
  image_url,
  images,
  image_count,
  array_length(images, 1) as actual_count
FROM wallpapers
WHERE uploaded_by = 'admin-user-id'
ORDER BY created_at DESC
LIMIT 5;
```

Should show:
- `images` array with multiple URLs
- `image_count` matching array length
- `image_url` containing first image

## Comparison: Upload vs Admin

Both pages now have identical functionality:

| Feature | Upload Page | Admin Page |
|---------|-------------|------------|
| Multiple Images | ✅ | ✅ |
| Max 15 Images | ✅ | ✅ |
| Image Preview Grid | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ |
| Image Count Badge | ✅ | ✅ |
| Sequential Upload | ✅ | ✅ |
| Waifu Terminology | ✅ | ✅ |

## Code Changes Summary

### Files Modified
1. **src/pages/Admin.tsx**
   - Added `MultipleImageUpload` import
   - Changed state from single to array
   - Updated upload logic for multiple images
   - Modified form to use `MultipleImageUpload` component
   - Updated preview to show image count
   - Changed terminology to "waifu"

### Files Used (No Changes Needed)
- `src/components/MultipleImageUpload.tsx` - Already exists
- `src/components/ImageSlider.tsx` - Already exists
- Database schema - Already updated

## Backward Compatibility

✅ All changes are backward compatible:
- Admin can still upload single images
- Old posts continue to work
- `image_url` field maintained
- No breaking changes

## Next Steps

1. **Apply Database Migration** (if not done yet)
   - Run `quick_migration.sql` in Supabase
   - See `FIX_UPLOAD_ERROR.md` for instructions

2. **Test Admin Upload**
   - Login as admin
   - Go to `/admin`
   - Try uploading multiple images
   - Verify in database

3. **Verify Display**
   - Check gallery shows image count
   - Open watch page - should show slider
   - Test download - should download all images

## Success Criteria

Admin panel is complete when:
- ✅ Can upload 1-15 images per post
- ✅ Images display in grid preview
- ✅ Upload succeeds with all images
- ✅ Database stores all image URLs
- ✅ Posts display correctly in gallery
- ✅ Watch page shows image slider
- ✅ All text says "waifu" not "wallpaper"

## Notes

- Admin panel now has feature parity with regular upload
- Both use the same `MultipleImageUpload` component
- Both follow the same upload flow
- Both store data in the same format
- Consistent user experience across the app

## Related Documentation

- `MULTIPLE_IMAGES_WAIFU_UPDATE.md` - Upload page changes
- `FIX_UPLOAD_ERROR.md` - Database migration guide
- `TEST_MULTIPLE_IMAGES.md` - Testing checklist
- `README_MULTIPLE_IMAGES.md` - Complete overview
