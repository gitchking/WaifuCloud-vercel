# Fix Category Deletion

## Problem
Category deletion fails when wallpapers are using that category due to foreign key constraints.

## Solution Implemented

Updated the Admin page to handle category deletion intelligently:

### Smart Delete Logic

**When deleting a category:**

1. **Check if wallpapers use it**
   - Counts how many wallpapers have this category

2. **If wallpapers exist (count > 0):**
   - Shows dialog with 2 options:
     - **OK** = Move wallpapers to "Uncategorized" and delete category
     - **Cancel** = Just deactivate the category (recommended)

3. **If no wallpapers:**
   - Asks for confirmation
   - Deletes the category permanently

### User Experience

**Scenario 1: Category has wallpapers**
```
Dialog: "This category has 5 waifu(s). Choose:

OK = Move waifus to "Uncategorized" and delete category
Cancel = Just deactivate the category (recommended)"
```

**Scenario 2: Empty category**
```
Dialog: "Delete this category? This cannot be undone."
```

## Features

### Soft Delete (Deactivate)
- Sets `is_active = false`
- Category hidden from users
- Wallpapers keep their category
- Can be reactivated later
- **Recommended approach**

### Hard Delete with Reassignment
- Moves all wallpapers to "Uncategorized"
- Deletes the category permanently
- Creates "Uncategorized" category if needed
- Shows count of moved wallpapers

### Safe Delete
- Empty categories can be deleted directly
- No data loss
- Confirmation required

## Database Function (Optional)

For advanced use, a SQL function is available in `fix_category_deletion.sql`:

```sql
-- Safely delete a category (reassigns wallpapers first)
SELECT safe_delete_category('category-id-here');
```

This function:
1. Checks if category exists
2. Counts wallpapers using it
3. Reassigns wallpapers to "Uncategorized"
4. Deletes the category
5. Returns status message

## Code Changes

### Admin.tsx - handleDeleteCategory

**Before:**
```typescript
const handleDeleteCategory = async (categoryId: string) => {
  if (!confirm("Are you sure?")) return;
  
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
    
  // Would fail if wallpapers exist!
};
```

**After:**
```typescript
const handleDeleteCategory = async (categoryId: string) => {
  // 1. Get category details
  // 2. Count wallpapers using it
  // 3. If wallpapers exist:
  //    - Offer to reassign or deactivate
  // 4. If empty:
  //    - Delete directly
  // 5. Handle all errors gracefully
};
```

## Testing

### Test Case 1: Delete Category with Wallpapers
1. Go to Admin → Manage Categories
2. Find a category with wallpapers
3. Click delete (trash icon)
4. Should see dialog with count
5. Choose "OK" to reassign
6. Verify wallpapers moved to "Uncategorized"
7. Verify category deleted

### Test Case 2: Deactivate Category
1. Go to Admin → Manage Categories
2. Find a category with wallpapers
3. Click delete (trash icon)
4. Choose "Cancel" to deactivate
5. Verify category is hidden from upload page
6. Verify wallpapers still have original category

### Test Case 3: Delete Empty Category
1. Create a new test category
2. Don't add any wallpapers to it
3. Click delete
4. Should delete immediately after confirmation

## Benefits

✅ **No More Errors** - Handles foreign key constraints
✅ **Data Safety** - Offers soft delete option
✅ **User Choice** - Let admin decide what to do
✅ **Clear Feedback** - Shows wallpaper count
✅ **Automatic Cleanup** - Creates "Uncategorized" if needed
✅ **Reversible** - Deactivated categories can be reactivated

## Reactivating Categories

To reactivate a deactivated category:

```sql
-- In Supabase SQL Editor
UPDATE categories
SET is_active = true
WHERE name = 'YourCategoryName';
```

Or add a "Reactivate" button in the Admin UI (future enhancement).

## Migration Required

If you want to use the SQL function, run `fix_category_deletion.sql` in Supabase SQL Editor.

Otherwise, the updated Admin.tsx code works without any database changes!

## Summary

Category deletion now:
- ✅ Checks for wallpapers first
- ✅ Offers soft delete (deactivate)
- ✅ Can reassign wallpapers
- ✅ Handles empty categories
- ✅ Shows clear messages
- ✅ Never loses data

No more "Failed to delete category" errors!
