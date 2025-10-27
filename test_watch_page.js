// Test script to check if watch page can fetch wallpapers
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jhusavzdsewoiwhvoczz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXNhdnpkc2V3b2l3aHZvY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDg3NzYsImV4cCI6MjA3Njk4NDc3Nn0.myHnVuRjoApv32bQJtYwdZV-moTdyGtm3D8dYohau-E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWatchPage() {
  console.log('Testing watch page functionality...');
  
  try {
    // First, get a list of wallpapers to test with
    const { data: wallpapers, error: wallpapersError } = await supabase
      .from('wallpapers')
      .select('id, title')
      .limit(3);
    
    if (wallpapersError) {
      console.error('Error fetching wallpapers:', wallpapersError);
      return;
    }
    
    console.log('Available wallpapers:', wallpapers);
    
    if (!wallpapers || wallpapers.length === 0) {
      console.log('No wallpapers found in database');
      return;
    }
    
    // Test fetching a specific wallpaper (like the watch page does)
    const testId = wallpapers[0].id;
    console.log(`Testing fetch for wallpaper ID: ${testId}`);
    
    const { data: wallpaper, error } = await supabase
      .from("wallpapers")
      .select("*")
      .eq("id", testId)
      .single();

    if (error) {
      console.error('Error fetching single wallpaper:', error);
      return;
    }
    
    console.log('Successfully fetched wallpaper:', {
      id: wallpaper.id,
      title: wallpaper.title,
      image_url: wallpaper.image_url,
      category: wallpaper.category,
      tags: wallpaper.tags,
      created_at: wallpaper.created_at
    });
    
    console.log('Watch page should work correctly!');
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testWatchPage();