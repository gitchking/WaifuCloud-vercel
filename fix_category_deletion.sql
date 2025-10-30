-- Fix Category Deletion
-- This allows categories to be deleted or deactivated properly

-- Option 1: Soft Delete (Recommended)
-- Instead of deleting, just deactivate the category
-- This preserves data integrity and allows reactivation later

-- Update the Admin page to use soft delete instead of hard delete
-- Change is_active to false instead of deleting the row

-- Option 2: Cascade Delete (Use with caution!)
-- This will delete all wallpapers using this category when category is deleted

-- First, check if there are wallpapers using categories
SELECT 
  c.id,
  c.name,
  COUNT(w.id) as wallpaper_count
FROM categories c
LEFT JOIN wallpapers w ON w.category = c.name
GROUP BY c.id, c.name
ORDER BY wallpaper_count DESC;

-- Option 2a: Add ON DELETE CASCADE to wallpapers
-- WARNING: This will delete wallpapers when category is deleted!
-- Only run if you want this behavior

-- ALTER TABLE wallpapers
-- DROP CONSTRAINT IF EXISTS wallpapers_category_fkey;
-- 
-- ALTER TABLE wallpapers
-- ADD CONSTRAINT wallpapers_category_fkey
-- FOREIGN KEY (category) REFERENCES categories(name)
-- ON DELETE CASCADE;

-- Option 2b: Reassign wallpapers to "Uncategorized" before deleting
-- This is safer - moves wallpapers to a default category

-- Create "Uncategorized" category if it doesn't exist
INSERT INTO categories (name, description, is_active)
VALUES ('Uncategorized', 'Wallpapers without a specific category', true)
ON CONFLICT (name) DO NOTHING;

-- Function to safely delete a category
CREATE OR REPLACE FUNCTION safe_delete_category(category_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_name TEXT;
  wallpaper_count INTEGER;
BEGIN
  -- Get category name
  SELECT name INTO category_name
  FROM categories
  WHERE id = category_id;
  
  IF category_name IS NULL THEN
    RAISE EXCEPTION 'Category not found';
  END IF;
  
  -- Count wallpapers using this category
  SELECT COUNT(*) INTO wallpaper_count
  FROM wallpapers
  WHERE category = category_name;
  
  IF wallpaper_count > 0 THEN
    -- Reassign wallpapers to "Uncategorized"
    UPDATE wallpapers
    SET category = 'Uncategorized'
    WHERE category = category_name;
    
    RAISE NOTICE 'Moved % wallpapers to Uncategorized', wallpaper_count;
  END IF;
  
  -- Now safe to delete the category
  DELETE FROM categories
  WHERE id = category_id;
  
  RAISE NOTICE 'Category deleted successfully';
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION safe_delete_category(UUID) TO authenticated;

-- Test the function (replace with actual category ID)
-- SELECT safe_delete_category('your-category-id-here');

-- Verify
SELECT 
  c.name as category,
  COUNT(w.id) as wallpaper_count
FROM categories c
LEFT JOIN wallpapers w ON w.category = c.name
GROUP BY c.name
ORDER BY wallpaper_count DESC;
