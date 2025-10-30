# Multiple Images Per Post - Implementation Guide

## Overview

This feature allows users to upload up to 15 images per wallpaper post with a slider to navigate between them.

## Step 1: Update Database Schema (2 minutes)

Run this SQL in Supabase SQL Editor:

```sql
-- File: add_multiple_images_support.sql
```

Go to: https://supabase.com/dashboard/project/jhusavzdsewoiwhvoczz/sql

This adds:
- `images` column (TEXT array) - stores multiple image URLs
- `image_count` column (INTEGER) - quick reference for count
- Constraint limiting to max 15 images
- Helper functions for adding/removing images

## Step 2: Update Upload Page

### Add State for Multiple Images

In `src/pages/Upload.tsx`, replace single image state with:

```typescript
// Replace these lines:
const [image, setImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

// With these:
const [images, setImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
```

### Import the Component

```typescript
import { MultipleImageUpload } from "@/components/MultipleImageUpload";
```

### Replace Image Input Section

Find the image input section and replace with:

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

### Update Upload Logic

In the `handleSubmit` function, update to upload multiple images:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (images.length === 0 || !title || !category) {
    toast.error("Please fill in all required fields and select at least one image");
    return;
  }

  setUploading(true);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("You must be logged in to upload");
    }

    // Upload all images
    const imageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const formData = new FormData();
      formData.append("file", images[i]);

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image ${i + 1}`);
      }

      const uploadResult = await uploadResponse.json();
      if (uploadResult.success && uploadResult.url) {
        imageUrls.push(uploadResult.url);
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("No images were uploaded successfully");
    }

    // Insert wallpaper with multiple images
    const { error: insertError } = await supabase
      .from("wallpapers")
      .insert({
        title,
        image_url: imageUrls[0], // First image as primary
        images: imageUrls, // All images
        image_count: imageUrls.length,
        tags: tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0),
        category: category.trim(),
        credit: credit || null,
        is_nsfw: isNSFW,
        orientation,
        uploaded_by: user.id,
      });

    if (insertError) throw insertError;

    toast.success(`Wallpaper with ${imageUrls.length} images uploaded successfully!`);
    navigate("/");
  } catch (error: unknown) {
    console.error("Upload error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to upload");
  } finally {
    setUploading(false);
  }
};
```

## Step 3: Update Watch Page

### Import ImageSlider

In `src/pages/Watch.tsx`:

```typescript
import { ImageSlider } from "@/components/ImageSlider";
```

### Replace Image Display

Find where the wallpaper image is displayed and replace with:

```typescript
<ImageSlider 
  images={wallpaper.images || [wallpaper.image_url]} 
  alt={wallpaper.title} 
/>
```

### Update Data Fetching

Make sure to fetch the `images` and `image_count` columns:

```typescript
const { data, error } = await supabase
  .from("wallpapers")
  .select("*, images, image_count")
  .eq("id", id)
  .single();
```

## Step 4: Update Admin Panel

In `src/pages/Admin.tsx`, update the wallpapers table to show image count:

```typescript
// Add column for image count
<TableHead>Images</TableHead>

// In the table body:
<TableCell>{wallpaper.image_count || 1}</TableCell>
```

## Step 5: Update WallpaperCard (Optional)

Add indicator for multiple images in `src/components/WallpaperCard.tsx`:

```typescript
{wallpaper.image_count > 1 && (
  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
    {wallpaper.image_count} images
  </div>
)}
```

## Features

### Upload Page:
✅ Upload up to 15 images per post
✅ Drag and drop support
✅ Image preview grid
✅ Remove individual images
✅ File size validation (5MB per image)
✅ Visual counter showing images uploaded

### Watch Page:
✅ Image slider with navigation arrows
✅ Thumbnail navigation below main image
✅ Image counter (1/5, 2/5, etc.)
✅ Keyboard navigation support
✅ Smooth transitions
✅ Responsive design

### Admin Panel:
✅ See image count for each post
✅ Manage multi-image posts

## Testing

### Test Upload:
1. Go to /upload
2. Click "Add Images"
3. Select multiple images (up to 15)
4. Fill in title, category, tags
5. Click "Upload Waifu"
6. Should upload all images ✅

### Test Watch Page:
1. Go to a wallpaper with multiple images
2. Should see slider with arrows
3. Click arrows to navigate
4. Click thumbnails to jump to image
5. Should show image counter ✅

### Test Limits:
1. Try uploading 16 images
2. Should show error: "Maximum 15 images" ✅
3. Try uploading large file (>5MB)
4. Should show error: "Must be less than 5MB" ✅

## Database Schema

```sql
wallpapers table:
- image_url: TEXT (primary/first image)
- images: TEXT[] (array of all image URLs)
- image_count: INTEGER (number of images)
```

## Benefits

✅ Better user experience
✅ More content per post
✅ Gallery-style viewing
✅ Backward compatible (single images still work)
✅ Efficient storage (array in single row)
✅ Easy to manage

## Files Created

- `add_multiple_images_support.sql` - Database schema
- `src/components/MultipleImageUpload.tsx` - Upload component
- `src/components/ImageSlider.tsx` - Slider component
- `MULTIPLE_IMAGES_IMPLEMENTATION.md` - This guide

## Next Steps

1. Run the SQL script
2. Update Upload.tsx with multiple image support
3. Update Watch.tsx with ImageSlider
4. Test thoroughly
5. Deploy!

🎉 Users can now upload multiple images per post!
