import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const CategoryDebug = () => {
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    const runDebug = async () => {
      const info: Record<string, unknown> = {
        categoryParam,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        searchParams: Object.fromEntries(searchParams.entries())
      };

      try {
        // Check if categories table exists and has data
        const { data: categories, error: categoriesError } = await supabase
          .from("categories")
          .select("*");
        
        info.categoriesQuery = { categories, categoriesError };

        // Check if the specific category exists
        if (categoryParam) {
          const { data: specificCategory, error: specificError } = await supabase
            .from("categories")
            .select("*")
            .eq("name", categoryParam);
          
          info.specificCategoryQuery = { specificCategory, specificError };

          // Check wallpapers for this category
          const { data: wallpapers, error: wallpapersError } = await supabase
            .from("wallpapers")
            .select("*")
            .eq("category", categoryParam);
          
          info.wallpapersQuery = { wallpapers, wallpapersError };
        }

      } catch (error) {
        info.debugError = error;
      }

      setDebugInfo(info);
      console.log("Category Debug Info:", info);
    };

    runDebug();
  }, [categoryParam, searchParams]);

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
      <h3 className="font-bold">Debug Information</h3>
      <pre className="text-xs mt-2 overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};