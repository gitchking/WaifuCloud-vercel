// Test script to check if categories are being fetched correctly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jhusavzdsewoiwhvoczz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXNhdnpkc2V3b2l3aHZvY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDg3NzYsImV4cCI6MjA3Njk4NDc3Nn0.myHnVuRjoApv32bQJtYwdZV-moTdyGtm3D8dYohau-E";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategories() {
  console.log('Testing categories fetch...');
  
  try {
    // Check if categories table exists and has data
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    console.log('Categories found:', categories?.length || 0);
    console.log('Categories:', categories);
    
    // If no categories, let's create a test one
    if (!categories || categories.length === 0) {
      console.log('No categories found, creating test category...');
      
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert([
          {
            name: 'Anime',
            description: 'Anime and manga wallpapers',
            is_active: true
          }
        ])
        .select();
      
      if (insertError) {
        console.error('Error creating category:', insertError);
      } else {
        console.log('Created category:', newCategory);
      }
    }
    
    // Check wallpapers count
    const { count: wallpaperCount } = await supabase
      .from('wallpapers')
      .select('*', { count: 'exact', head: true });
    
    console.log('Total wallpapers:', wallpaperCount);
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testCategories();