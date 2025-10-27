// Test category creation to debug the issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategoryCreation() {
  console.log('Testing category creation...');
  
  try {
    // Test 1: Check if categories table exists and structure
    console.log('\n1. Checking categories table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    console.log('Table query result:', { data: tableInfo, error: tableError });
    
    // Test 2: Try to insert a simple category
    console.log('\n2. Testing category insertion...');
    const testCategory = {
      name: 'Test Category ' + Date.now(),
      description: 'Test description',
      is_active: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select();
    
    console.log('Insert result:', { data: insertData, error: insertError });
    
    if (insertError) {
      console.error('Insert error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    }
    
    // Test 3: Check current user and admin status
    console.log('\n3. Checking user authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', { user: session?.user?.id, error: sessionError });
    
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('Profile:', { profile, error: profileError });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCategoryCreation();