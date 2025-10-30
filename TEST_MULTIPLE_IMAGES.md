# Testing Multiple Images Feature

## Quick Test Guide

### 1. Test Upload Page

**Navigate to**: `/upload`

**Test Single Image Upload:**
1. Fill in title: "Test Waifu Single"
2. Select category
3. Upload 1 image
4. Verify preview shows correctly
5. Submit and check success

**Test Multiple Images Upload:**
1. Fill in title: "Test Waifu Multiple"
2. Select category
3. Click "Add Images" button
4. Select 3-5 images
5. Verify all images show in grid with numbers
6. Check preview shows "X images" badge
7. Submit and verify success message

**Test Maximum Limit:**
1. Try to upload more than 15 images
2. Should show error: "Maximum 15 images allowed per post"

### 2. Test Dashboard

**Navigate to**: `/dashboard`

**Verify Display:**
1. Check that posts with multiple images show count badge
2. Badge should display number in bottom-right of thumbnail
3. All text should say "Waifu" not "Wallpaper"
4. Stats should show "Total Waifus"

**Test Edit:**
1. Click edit on any post
2. Dialog title should say "Edit Waifu"
3. All fields should work correctly
4. Save changes and verify

**Test Delete:**
1. Click delete on any post
2. Dialog should say "Delete Waifu"
3. Confirm deletion
4. Verify post is removed

### 3. Test Watch Page

**Navigate to**: `/watch/{id}` (click any waifu)

**Single Image Post:**
1. Should display image normally
2. No slider controls
3. Download button downloads single image

**Multiple Images Post:**
1. Should show image slider with thumbnails
2. Click thumbnails to navigate
3. Use arrow buttons to navigate
4. Counter shows "X / Y" format
5. Download button downloads all images with delay

### 4. Test Gallery Pages

**Main Gallery** (`/wallpapers`):
1. Cards with multiple images show badge
2. Badge displays "{count} images"
3. Clicking opens watch page with slider

**Favourites** (`/favourites`):
1. Same badge behavior
2. Multiple image posts display correctly

### 5. Terminology Check

Verify all these say "Waifu" not "Wallpaper":
- [ ] Upload page title: "Upload Waifu"
- [ ] Upload page description mentions "anime artwork"
- [ ] Upload button: "Upload Waifu"
- [ ] Dashboard title: "My Dashboard"
- [ ] Dashboard section: "Your Waifus"
- [ ] Dashboard empty state: "You haven't uploaded any waifus yet"
- [ ] Dashboard button: "Upload Your First Waifu"
- [ ] Edit dialog: "Edit Waifu"
- [ ] Delete dialog: "Delete Waifu"
- [ ] Success messages use "waifu"
- [ ] Error messages use "waifu"

## Expected Behavior

### Upload Flow
```
1. User selects multiple images
2. All images show in grid preview
3. User fills form and submits
4. Each image uploads sequentially
5. Database stores all URLs in images array
6. Success message shows
7. Redirects to home
```

### View Flow
```
1. User clicks waifu card with multiple images
2. Watch page loads with ImageSlider
3. First image displays
4. Thumbnails show below
5. User can navigate between images
6. Download downloads all images
```

### Edit Flow
```
1. User opens dashboard
2. Clicks edit on post
3. Can modify title, tags, category, credit
4. Cannot add/remove images (future feature)
5. Saves successfully
```

## Common Issues & Solutions

**Issue**: Images not uploading
- Check network tab for errors
- Verify Supabase edge function is deployed
- Check file size limits (5MB per image)

**Issue**: Slider not showing
- Verify images array is populated
- Check ImageSlider component is imported
- Verify images field is fetched from database

**Issue**: Download not working
- Check CORS settings
- Verify image URLs are accessible
- Check browser console for errors

**Issue**: Badge not showing
- Verify image_count field is fetched
- Check WallpaperCard component logic
- Ensure image_count > 1

## Database Verification

Run this SQL to check data:
```sql
SELECT 
  id,
  title,
  image_url,
  images,
  image_count,
  array_length(images, 1) as actual_count
FROM wallpapers
WHERE image_count > 1
LIMIT 10;
```

Should show:
- `images` array with multiple URLs
- `image_count` matching array length
- `image_url` containing first image

## Success Criteria

✅ Can upload 1-15 images per post
✅ Multiple images display in slider
✅ Download works for all images
✅ Image count badge shows on cards
✅ All "waifu" terminology correct
✅ Backward compatible with old posts
✅ No console errors
✅ Smooth user experience
