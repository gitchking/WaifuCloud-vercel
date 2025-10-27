// Simple test to check if categories route is working
console.log("Testing categories route...");

// Test if we can access the categories page
fetch('/categories')
  .then(response => {
    console.log('Categories route status:', response.status);
    if (response.status === 404) {
      console.log('Route not found - check router configuration');
    } else {
      console.log('Route exists');
    }
  })
  .catch(error => {
    console.log('Error testing route:', error);
  });

// Test database connection
import { supabase } from '@/integrations/supabase/client';

async function testCategoriesTable() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    console.log('Categories table test:', { data, error });
  } catch (err) {
    console.log('Categories table error:', err);
  }
}

testCategoriesTable();