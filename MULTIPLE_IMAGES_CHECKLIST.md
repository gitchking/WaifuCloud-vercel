# ✅ Multiple Images Feature - Quick Checklist

## Step 1: Database (2 minutes)

- [ ] Go to: https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz/sql
- [ ] Copy SQL from: `add_multiple_images_support.sql`
- [ ] Click "Run"
- [ ] Verify: Should see "Success" message

## Step 2: Components (Already Created)

- [x] `src/components/MultipleImageUpload.tsx` - Upload multiple images
- [x] `src/components/ImageSlider.tsx` - Display slider on watch page

## Step 3: Update Upload Page

In `src/pages/Upload.tsx`:

### Replace State:
```typescript
// OLD:
const [image, setImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

// NEW:
const [images, setImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
```

### Add Import:
```typescript
import { MultipleImageUpload } from "@/components/MultipleImageUpload";
```

### Replace Image Input:
Find the image input section, replace with:
```typescript
<MultipleImageUpload
  images={images}
  imagePreviews={imagePreviews}
  onImagesChange={(newImages, newPreviews) => {
    setImages(newImages);
    setImagePreviews(newPreviews);
  }}
/>
```

### Update handleSubmit:
- Change validation: `if (images.length === 0 ...)`
- Upload all images in loop
- Store in `images` array
- Set `image_count`

## Step 4: Update Watch Page

In `src/pages/Watch.tsx`:

### Add Import:
```typescript
import { ImageSlider } from "@/components/ImageSlider";
```

### Replace Image Display:
```typescript
// OLD:
<img src={wallpaper.image_url} alt={wallpaper.title} />

// NEW:
<ImageSlider 
  images={wallpaper.images || [wallpaper.image_url]} 
  alt={wallpaper.title} 
/>
```

### Update Query:
```typescript
.select("*, images, image_count")
```

## Step 5: Test

- [ ] Upload single image - Should work
- [ ] Upload multiple images (2-5) - Should work
- [ ] Try 16 images - Should show error
- [ ] View multi-image post - Should see slider
- [ ] Navigate with arrows - Should work
- [ ] Click thumbnails - Should jump to image

## Features Checklist

### Upload Page:
- [ ] Can select multiple images
- [ ] Shows preview grid
- [ ] Can remove individual images
- [ ] Shows counter (X/15)
- [ ] Validates file size
- [ ] Validates max 15 images

### Watch Page:
- [ ] Shows image slider
- [ ] Navigation arrows work
- [ ] Thumbnail navigation works
- [ ] Shows image counter (1/5)
- [ ] Smooth transitions
- [ ] Single images still work

## Quick Reference

**Max Images:** 15 per post
**Max File Size:** 5MB per image
**Supported:** JPG, PNG, GIF, WebP

## Files to Modify

- [ ] `src/pages/Upload.tsx` - Add multiple upload
- [ ] `src/pages/Watch.tsx` - Add slider
- [ ] Database - Run SQL script

## Files Already Created

- [x] `src/components/MultipleImageUpload.tsx`
- [x] `src/components/ImageSlider.tsx`
- [x] `add_multiple_images_support.sql`

## Estimated Time

- Database: 2 minutes
- Upload page: 10 minutes
- Watch page: 5 minutes
- Testing: 5 minutes
**Total: ~20 minutes**

## Success Indicators

✅ Can upload multiple images
✅ Slider shows on watch page
✅ Arrows navigate between images
✅ Thumbnails work
✅ Counter shows correctly
✅ Single images still work
✅ Max 15 images enforced

🎉 Feature complete!
