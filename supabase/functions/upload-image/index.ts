import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Upload function called');
    
    const imgbbApiKey = Deno.env.get('IMGBB_API_KEY');
    
    if (!imgbbApiKey) {
      console.error('IMGBB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Image hosting not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('IMGBB_API_KEY found:', imgbbApiKey ? 'YES' : 'NO');

    // Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      console.error('No file provided or invalid file type');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Uploading file:', file.name, 'Size:', file.size);

    // Upload to ImgBB
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    console.log('Making request to ImgBB API');
    
    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    console.log('ImgBB response status:', imgbbResponse.status);
    
    if (!imgbbResponse.ok) {
      const errorText = await imgbbResponse.text();
      console.error('ImgBB API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: `ImgBB API error: ${errorText}`,
          status: imgbbResponse.status
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imgbbResult = await imgbbResponse.json();
    console.log('ImgBB response:', JSON.stringify(imgbbResult, null, 2));

    if (imgbbResult.success && imgbbResult.data?.url) {
      console.log('Upload successful, returning URL:', imgbbResult.data.url);
      return new Response(
        JSON.stringify({ 
          success: true, 
          url: imgbbResult.data.url,
          provider: 'imgbb'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If upload failed
    console.error('ImgBB upload failed:', imgbbResult);
    return new Response(
      JSON.stringify({ 
        error: imgbbResult.error?.message || 'Image upload failed',
        details: imgbbResult
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});