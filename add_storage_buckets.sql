-- Create storage buckets for wallpapers and avatars
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('wallpapers', 'wallpapers', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;