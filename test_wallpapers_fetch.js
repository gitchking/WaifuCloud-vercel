// Test script to check if wallpapers are being stored and can be fetched
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jhusavzdsewoiwhvoczz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXNhdnpkc2V3b2l3aHZvY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDg3NzYsImV4cCI6MjA3Njk4NDc3Nn0.myHnVuRjoApv32bQJtYwdZV-moTdyGtm3D8dYohau-E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWallpapersFetch() {
  console.log('Testing wallpapers fetch...');
  
  try {
    // Test basic fetch
    console.log('1. Testing basic wallpapers fetch...');
    const { data: allWallpapers, error: allError } = await supabase
      .from('wallpapers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('Error fetching all wallpapers:', allError);
      return;
    }
    
    console.log(`Found ${allWallpapers?.length || 0} total wallpapers`);
    
    if (allWallpapers && allWallpapers.length > 0) {
      console.log('Sample wallpaper:', {
        id: allWallpapers[0].id,
        title: allWallpapers[0].title,
        category: allWallpapers[0].category,
        is_nsfw: allWallpapers[0].is_nsfw,
        orientation: allWallpapers[0].orientation,
        created_at: allWallpapers[0].created_at
      });
    }
    
    // Test NSFW filtering (non-NSFW only)
    console.log('\n2. Testing non-NSFW wallpapers fetch...');
    const { data: safeWallpapers, error: safeError } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('is_nsfw', false)
      .order('created_at', { ascending: false });
    
    if (safeError) {
      console.error('Error fetching safe wallpapers:', safeError);
      return;
    }
    
    console.log(`Found ${safeWallpapers?.length || 0} non-NSFW wallpapers`);
    
    // Test orientation filtering
    console.log('\n3. Testing horizontal wallpapers fetch...');
    const { data: horizontalWallpapers, error: horizontalError } = await supabase
      .from('wallpapers')
      .select('*')
      .or('orientation.eq.horizontal,orientation.is.null')
      .eq('is_nsfw', false)
      .order('created_at', { ascending: false });
    
    if (horizontalError) {
      console.error('Error fetching horizontal wallpapers:', horizontalError);
      return;
    }
    
    console.log(`Found ${horizontalWallpapers?.length || 0} horizontal wallpapers`);
    
    // Test vertical wallpapers
    console.log('\n4. Testing vertical wallpapers fetch...');
    const { data: verticalWallpapers, error: verticalError } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('orientation', 'vertical')
      .eq('is_nsfw', false)
      .order('created_at', { ascending: false });
    
    if (verticalError) {
      console.error('Error fetching vertical wallpapers:', verticalError);
      return;
    }
    
    console.log(`Found ${verticalWallpapers?.length || 0} vertical wallpapers`);
    
    console.log('\n✅ Database test completed successfully!');
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testWallpapersFetch();