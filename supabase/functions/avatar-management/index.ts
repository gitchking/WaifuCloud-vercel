// Serverless function to manage user avatars
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get the user from the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // List all avatar files for this user
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('avatars')
      .list(`${user.id}/`);

    if (listError) {
      console.error("Error listing avatars:", listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list avatars' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Delete all existing avatar files for this user
    if (existingFiles && existingFiles.length > 0) {
      const filePaths = existingFiles.map(file => `avatars/${user.id}/${file.name}`);
      console.log("Deleting existing avatars:", filePaths);
      
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filePaths);
        
      if (deleteError) {
        console.error("Error deleting avatars:", deleteError);
        // Don't fail the whole operation if deletion fails, just log it
      } else {
        console.log("Successfully deleted existing avatars");
      }
    }

    return new Response(
      JSON.stringify({ message: 'Avatar cleanup completed', deleted: existingFiles?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Error in avatar management function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});