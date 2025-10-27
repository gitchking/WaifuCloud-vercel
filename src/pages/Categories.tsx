import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/wallpaper";
import { Search, X } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories with wallpaper counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        throw categoriesError;
      }

      // Get wallpaper counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('wallpapers')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.name);

          // Use category thumbnail_url if available, otherwise get a sample wallpaper
          let thumbnail = category.thumbnail_url;
          
          if (!thumbnail) {
            const { data: sampleWallpaper } = await supabase
              .from('wallpapers')
              .select('image_url')
              .eq('category', category.name)
              .limit(1)
              .single();
            thumbnail = sampleWallpaper?.image_url;
          }

          return {
            id: category.id,
            name: category.name,
            thumbnail: thumbnail || '/placeholder.svg',
            count: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-8">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Categories
            </h1>
            <p className="text-muted-foreground">
              Browse wallpapers by your favorite categories
            </p>
          </div>
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading categories..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-8">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Categories
            </h1>
            <p className="text-muted-foreground">
              Browse wallpapers by your favorite categories
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            {/* Page Heading */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
                Categories
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Browse waifus by your favorite categories
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-shrink-0 w-full lg:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-card border-border"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} found for "
                <span className="font-medium text-foreground">{searchQuery}</span>"
              </p>
            </div>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No categories available yet.
            </p>
          </div>
        ) : filteredCategories.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No categories found</h2>
            <p className="text-muted-foreground mb-4">
              No categories match your search for "{searchQuery}"
            </p>
            <button
              onClick={clearSearch}
              className="text-primary hover:underline"
            >
              Clear search to see all categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Categories;