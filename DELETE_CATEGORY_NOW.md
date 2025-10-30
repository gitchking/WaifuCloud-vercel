# Delete Category - Immediate Fix

## Quick Fix (Works Right Now!)

### Option 1: Use SQL Function (Easiest)

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and paste** from `immediate_category_delete_fix.sql`
3. **Click Run** to create the function
4. **Delete a category** by running:

```sql
-- Replace 'YourCategoryName' with actual name
SELECT delete_category_safe('YourCategoryName');
```

**Example:**
```sql
SELECT delete_category_safe('Test');
```

This will:
- ✅ Move all wallpapers to "Uncategorized"
- ✅ Delete the category
- ✅ Show success message

---

### Option 2: Manual SQL (If you know the category name)

```sql
-- 1. Create Uncategorized category
INSERT INTO categories (name, description, is_active)
VALUES ('Uncategorized', 'Waifus without a specific category', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Move wallpapers (replace 'Test' with your category name)
UPDATE wallpapers 
SET category = 'Uncategorized' 
WHERE category = 'Test';

-- 3. Delete the category
DELETE FROM categories 
WHERE name = 'Test';
```

---

### Option 3: Wait for Deployment

The updated Admin page code is already pushed to GitHub.

**Vercel will auto-deploy** and then you can delete categories from the UI with:
- Smart prompts
- Wallpaper count
- Deactivate option

**Check deployment:** https://vercel.com/dashboard

---

## Why This Happens

Categories can't be deleted if wallpapers are using them (foreign key constraint).

**Solutions:**
1. ✅ Reassign wallpapers first (what the SQL does)
2. ✅ Deactivate instead of delete (new UI feature)
3. ✅ Delete empty categories only

---

## See All Categories

To see which categories have wallpapers:

```sql
SELECT 
  c.name as category_name,
  c.is_active,
  COUNT(w.id) as wallpaper_count
FROM categories c
LEFT JOIN wallpapers w ON w.category = c.name
GROUP BY c.id, c.name, c.is_active
ORDER BY wallpaper_count DESC;
```

---

## Quick Examples

```sql
-- Delete "Test" category
SELECT delete_category_safe('Test');

-- Delete "Sample" category
SELECT delete_category_safe('Sample');

-- Delete "Old" category
SELECT delete_category_safe('Old');
```

---

## After Running

You should see:
```
Success! Deleted category "Test" and moved 5 wallpaper(s) to Uncategorized
```

Then refresh your Admin page and the category will be gone!

---

## Future: UI Will Handle This

Once Vercel deploys the new code, the Admin UI will:
- ✅ Check wallpaper count automatically
- ✅ Ask what to do (reassign or deactivate)
- ✅ Handle everything for you
- ✅ No SQL needed

But for NOW, use the SQL function above! 🚀
