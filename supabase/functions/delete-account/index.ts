import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create regular client to verify the user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    console.log("Deleting account for user:", user.id);

    // Delete user's wallpapers
    const { error: wallpapersError } = await supabaseAdmin
      .from("wallpapers")
      .delete()
      .eq("uploaded_by", user.id);

    if (wallpapersError) {
      console.error("Error deleting wallpapers:", wallpapersError);
    }

    // Delete user's favorites
    const { error: favoritesError } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", user.id);

    if (favoritesError) {
      console.error("Error deleting favorites:", favoritesError);
    }

    // Delete user's profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
    }

    // Delete user's avatar from storage if exists
    try {
      const { data: files } = await supabaseAdmin.storage
        .from("avatars")
        .list(`${user.id}/`);

      if (files && files.length > 0) {
        const filePaths = files.map((file) => `${user.id}/${file.name}`);
        await supabaseAdmin.storage.from("avatars").remove(filePaths);
      }
    } catch (storageError) {
      console.error("Error deleting avatar:", storageError);
    }

    // Finally, delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account deleted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
