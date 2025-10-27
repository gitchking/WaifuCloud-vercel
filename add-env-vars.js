const { exec } = require('child_process');

// Add VITE_SUPABASE_URL
exec('echo "https://jhusavzdsewoiwhvoczz.supabase.co" | vercel env add VITE_SUPABASE_URL production', (error, stdout, stderr) => {
  if (error) {
    console.log(`Error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

// Add VITE_SUPABASE_PUBLISHABLE_KEY
exec('echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXNhdnpkc2V3b2l3aHZvY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDg3NzYsImV4cCI6MjA3Njk4NDc3Nn0.myHnVuRjoApv32bQJtYwdZV-moTdyGtm3D8dYohau-E" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production', (error, stdout, stderr) => {
  if (error) {
    console.log(`Error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

// Add IMGBB_API_KEY
exec('echo "3fdec92ac3588437eb154f58cf24d8ea" | vercel env add IMGBB_API_KEY production', (error, stdout, stderr) => {
  if (error) {
    console.log(`Error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});