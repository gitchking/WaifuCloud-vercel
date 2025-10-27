// Vercel serverless function to handle image uploads - clean implementation
const nodeFetch = require('node-fetch');
const NodeFormData = require('form-data');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only POST requests are allowed.'
    });
    return;
  }

  try {
    // Read the file data
    const buffers = [];
    const maxLength = 64 * 1024 * 1024; // 64MB limit
    let totalLength = 0;
    
    for await (const chunk of req) {
      totalLength += chunk.length;
      if (totalLength > maxLength) {
        throw new Error('File too large. Maximum size is 64MB.');
      }
      buffers.push(chunk);
    }
    
    const fileBuffer = Buffer.concat(buffers);
    
    if (fileBuffer.length === 0) {
      throw new Error('No file data received');
    }
    
    const contentType = req.headers['content-type'] || 'image/jpeg';
    
    // Try Pixeldrain first (reliable service)
    try {
      console.log('Attempting upload to Pixeldrain');
      
      const formData = new NodeFormData();
      formData.append('file', fileBuffer, {
        filename: 'image.jpg',
        contentType: contentType
      });
      
      const response = await nodeFetch('https://pixeldrain.com/api/file', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.id) {
          const imageUrl = `https://pixeldrain.com/u/${result.id}`;
          console.log('Successfully uploaded to Pixeldrain:', imageUrl);
          res.status(200).json({ 
            success: true, 
            imageUrl: imageUrl 
          });
          return;
        }
      }
    } catch (pixeldrainError) {
      console.error('Pixeldrain upload failed:', pixeldrainError.message);
    }
    
    // Fallback to Freeimage.host
    try {
      console.log('Attempting upload to Freeimage.host');
      
      const formData = new NodeFormData();
      formData.append('image', fileBuffer, {
        filename: 'image.jpg',
        contentType: contentType
      });
      
      const response = await nodeFetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.image && result.image.url) {
          console.log('Successfully uploaded to Freeimage.host:', result.image.url);
          res.status(200).json({ 
            success: true, 
            imageUrl: result.image.url 
          });
          return;
        }
      }
    } catch (freeimageError) {
      console.error('Freeimage.host upload failed:', freeimageError.message);
    }
    
    // If both services fail
    throw new Error('Failed to upload to any service. Please try again later.');
    
  } catch (error) {
    console.error('Upload error:', error.message);
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload image'
    });
  }
};