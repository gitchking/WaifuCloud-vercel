-- IMMEDIATE FIX: Allow Category Deletion
-- Run this in Supabase SQL Editor RIGHT NOW

-- This will allow you to delete categories immediately
-- by reassigning wallpapers to "Uncategorized" first

-- Step 1: Create "Uncategorized" category if it doesn't exist
INSERT INTO categories (name, description, is_active)
VALUES ('Uncategorized', 'Waifus without a specific category', true)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Find which category you want to delete and reassign its wallpapers
-- Replace 'YourCategoryName' with the actual category name

-- Example: If you want to delete "Test" category:
-- UPDATE wallpapers SET category = 'Uncategorized' WHERE category = 'Test';
-- DELETE FROM categories WHERE name = 'Test';

-- Step 3: Or use this function to do it automatically
CREATE OR REPLACE FUNCTION delete_category_safe(category_name_to_delete TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wallpaper_count INTEGER;
  category_id_to_delete UUID;
BEGIN
  -- Get category ID
  SELECT id INTO category_id_to_delete
  FROM categories
  WHERE name = category_name_to_delete;
  
  IF category_id_to_delete IS NULL THEN
    RETURN 'Category not found: ' || category_name_to_delete;
  END IF;
  
  -- Count wallpapers
  SELECT COUNT(*) INTO wallpaper_count
  FROM wallpapers
  WHERE category = category_name_to_delete;
  
  -- Ensure Uncategorized exists
  INSERT INTO categories (name, description, is_active)
  VALUES ('Uncategorized', 'Waifus without a specific category', true)
  ON CONFLICT (name) DO NOTHING;
  
  -- Reassign wallpapers if any exist
  IF wallpaper_count > 0 THEN
    UPDATE wallpapers
    SET category = 'Uncategorized'
    WHERE category = category_name_to_delete;
  END IF;
  
  -- Delete the category
  DELETE FROM categories
  WHERE id = category_id_to_delete;
  
  RETURN 'Success! Deleted category "' || category_name_to_delete || 
         '" and moved ' || wallpaper_count || ' wallpaper(s) to Uncategorized';
END;
$$;

GRANT EXECUTE ON FUNCTION delete_category_safe(TEXT) TO authenticated;

-- HOW TO USE:
-- Replace 'CategoryNameHere' with the actual category name you want to delete

-- Example:
-- SELECT delete_category_safe('Test');
-- SELECT delete_category_safe('Old Category');

-- To see all categories and their wallpaper counts:
SELECT 
  c.name as category_name,
  c.is_active,
  COUNT(w.id) as wallpaper_count
FROM categories c
LEFT JOIN wallpapers w ON w.category = c.name
GROUP BY c.id, c.name, c.is_active
ORDER BY wallpaper_count DESC;

-- Quick delete examples (uncomment and modify as needed):
-- SELECT delete_category_safe('Test');
-- SELECT delete_category_safe('Sample');
-- SELECT delete_category_safe('Demo');
