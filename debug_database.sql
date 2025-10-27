-- Debug script to check database setup
-- Run this in your Supabase SQL Editor

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'wallpapers');

-- 2. Check categories table structure and data
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public';

-- 3. Check if categories exist
SELECT * FROM categories;

-- 4. Check wallpapers table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wallpapers' 
AND table_schema = 'public';

-- 5. Check if any wallpapers exist
SELECT id, title, category, created_at FROM wallpapers LIMIT 5;

-- 6. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('categories', 'wallpapers');

-- 7. Insert test category if it doesn't exist
INSERT INTO categories (name, description, is_active) 
VALUES ('Anime', 'Anime and manga wallpapers', true)
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 8. Check the inserted category
SELECT * FROM categories WHERE name = 'Anime';