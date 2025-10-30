-- Create favorites table if it doesn't exist
-- This allows users to favorite/bookmark wallpapers

-- Check if table exists first
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
    
    -- Create the favorites table
    CREATE TABLE public.favorites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, wallpaper_id)
    );

    -- Enable RLS
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own favorites"
      ON public.favorites FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can add favorites"
      ON public.favorites FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can remove their own favorites"
      ON public.favorites FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);

    -- Create index for performance
    CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
    CREATE INDEX idx_favorites_wallpaper_id ON public.favorites(wallpaper_id);

    RAISE NOTICE 'Favorites table created successfully';
  ELSE
    RAISE NOTICE 'Favorites table already exists';
  END IF;
END $$;

-- Verify the table
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'favorites') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'favorites';
