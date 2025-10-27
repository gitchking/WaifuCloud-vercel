// Test script to check if the upload function is working
const fs = require('fs');

async function testUploadFunction() {
  try {
    // Create a simple text file for testing
    const testContent = 'This is a test file for upload function';
    fs.writeFileSync('test-file.txt', testContent);
    
    // Read the file
    const fileBuffer = fs.readFileSync('test-file.txt');
    const file = new File([fileBuffer], "test-file.txt", { type: "text/plain" });
    
    // Test the upload function
    const formData = new FormData();
    formData.append("file", file);
    
    console.log('Testing upload function...');
    
    const response = await fetch(
      'https://jhusavzdsewoiwhvoczz.supabase.co/functions/v1/upload-image',
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const result = await response.json();
    console.log('Upload function response:', result);
    
    // Clean up
    fs.unlinkSync('test-file.txt');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Polyfill for File in Node.js
class File extends Blob {
  constructor(chunks, filename, options = {}) {
    super(chunks, options);
    this.name = filename;
    this.lastModified = options.lastModified || Date.now();
  }
}

global.File = File;

testUploadFunction();