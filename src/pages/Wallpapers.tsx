import { WallpaperGrid } from "@/components/WallpaperGrid";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSection } from "@/components/FilterSection";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, CategoryHeadingSkeleton } from "@/components/LoadingSpinner";
import { Pagination } from "@/components/Pagination";
import { useFilters } from "@/hooks/useFilters";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wallpaper } from "@/types/wallpaper";

// Color mapping based on first letter of tag
const getTagColor = (tag: string) => {
  if (!tag) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  
  const firstLetter = tag.charAt(0).toUpperCase();
  const colorMap: Record<string, string> = {
    'A': "bg-amber-500/10 text-amber-600 border-amber-500/20",
    'B': "bg-blue-500/10 text-blue-600 border-blue-500/20",
    'C': "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    'D': "bg-red-800/10 text-red-700 border-red-800/20",
    'E': "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    'F': "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
    'G': "bg-green-500/10 text-green-600 border-green-500/20",
    'H': "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    'I': "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    'J': "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
    'K': "bg-yellow-600/10 text-yellow-700 border-yellow-600/20",
    'L': "bg-purple-400/10 text-purple-600 border-purple-400/20",
    'M': "bg-pink-500/10 text-pink-600 border-pink-500/20",
    'N': "bg-blue-900/10 text-blue-800 border-blue-900/20",
    'O': "bg-orange-500/10 text-orange-600 border-orange-500/20",
    'P': "bg-purple-500/10 text-purple-600 border-purple-500/20",
    'Q': "bg-pink-400/10 text-pink-600 border-pink-400/20",
    'R': "bg-red-500/10 text-red-600 border-red-500/20",
    'S': "bg-sky-500/10 text-sky-600 border-sky-500/20",
    'T': "bg-teal-500/10 text-teal-600 border-teal-500/20",
    'U': "bg-blue-700/10 text-blue-800 border-blue-700/20",
    'V': "bg-violet-500/10 text-violet-600 border-violet-500/20",
    'W': "bg-slate-500/10 text-slate-600 border-slate-500/20",
    'X': "bg-green-700/10 text-green-800 border-green-700/20",
    'Y': "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    'Z': "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  return colorMap[firstLetter] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
};

const Wallpapers = () => {
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [nsfwEnabled, setNsfwEnabled] = useState(() => 
    user ? localStorage.getItem("nsfw-enabled") === "true" : false
  );
  const [categoryData, setCategoryData] = useState<{name: string, description?: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination constants
  const WALLPAPERS_PER_ROW = 4; // lg:grid-cols-4 from WallpaperGrid
  const ROWS_PER_PAGE = 4;
  const WALLPAPERS_PER_PAGE = WALLPAPERS_PER_ROW * ROWS_PER_PAGE; // 16 wallpapers per page

  // Function to get favorites count for trending calculation
  const getFavoritesCount = (wallpaperId: string): number => {
    try {
      // This is a simplified approach - in a real app, you'd track this server-side
      const allFavorites = localStorage.getItem('favouriteWallpapers');
      if (allFavorites) {
        const favorites = JSON.parse(allFavorites);
        return favorites.includes(wallpaperId) ? 1 : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };
  const { filters, updateFilters } = useFilters();
  
  // Get category and page from URL parameters
  const categoryFilter = searchParams.get('category');
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

  // Update current page when URL changes
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  // Fetch category data if filtering by category
  const fetchCategoryData = useCallback(async () => {
    if (!categoryFilter) {
      setCategoryData(null);
      return;
    }

    setCategoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, description')
        .eq('name', categoryFilter)
        .single();

      if (error) {
        console.error('Error fetching category data:', error);
        // Fallback to using the filter name
        setCategoryData({ name: categoryFilter });
      } else {
        setCategoryData(data);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData({ name: categoryFilter });
    } finally {
      setCategoryLoading(false);
    }
  }, [categoryFilter]);

  const fetchWallpapers = useCallback(async () => {
    try {
      
      console.log('Fetching wallpapers with filters:', filters);
      console.log('NSFW enabled:', nsfwEnabled);
      
      let query = supabase
        .from("wallpapers")
        .select("*");

      // Apply device filter based on orientation
      if (filters.device === 'desktop') {
        // Desktop: show only horizontal wallpapers
        query = query.or("orientation.eq.horizontal,orientation.is.null");
        console.log('Filtering for desktop (horizontal) wallpapers');
      } else if (filters.device === 'phone') {
        // Phone: show only vertical wallpapers
        query = query.eq("orientation", "vertical");
        console.log('Filtering for phone (vertical) wallpapers');
      }

      // Apply sorting
      switch (filters.sort) {
        case 'latest':
          query = query.order("created_at", { ascending: false });
          break;
        case 'trending':
          // Sort by favorites count (most favorited wallpapers)
          // We'll need to calculate this based on localStorage favorites across users
          // For now, we'll use a combination of recent and popular
          query = query.order("created_at", { ascending: false });
          break;
      }

      // Apply category filter if specified in URL
      if (categoryFilter) {
        query = query.eq("category", categoryFilter);
        console.log('Filtering by category:', categoryFilter);
      }

      // Apply NSFW filter - only show NSFW content to logged-in users who have enabled it
      if (!user || !nsfwEnabled) {
        query = query.eq("is_nsfw", false);
        console.log('Filtering out NSFW content - user not logged in or NSFW disabled');
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('Raw wallpapers data:', data);
      console.log('Found wallpapers count:', data?.length || 0);

      let processedWallpapers = data.map((w: {
        id: string;
        title: string;
        image_url: string;
        images: string[] | null;
        image_count: number | null;
        tags: string[] | null;
        category: string;
        is_nsfw: boolean;
        created_at: string;
        orientation: string | null;
      }) => ({
        id: w.id,
        title: w.title,
        imageUrl: w.image_url,
        image_url: w.image_url,
        images: w.images || [w.image_url],
        image_count: w.image_count || 1,
        tags: w.tags || [],
        category: w.category,
        isNSFW: w.is_nsfw,
        uploadedAt: w.created_at,
        created_at: w.created_at,
        orientation: w.orientation || "horizontal",
      }));

      // Apply client-side trending sort if needed
      if (filters.sort === 'trending') {
        processedWallpapers = processedWallpapers.sort((a, b) => {
          const aFavorites = getFavoritesCount(a.id);
          const bFavorites = getFavoritesCount(b.id);
          
          // If favorites are equal, sort by recency
          if (aFavorites === bFavorites) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          
          return bFavorites - aFavorites;
        });
      }

      console.log('Processed wallpapers:', processedWallpapers);
      setWallpapers(processedWallpapers);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, nsfwEnabled, categoryFilter]);

  // Calculate paginated wallpapers
  const paginatedWallpapers = useMemo(() => {
    const startIndex = (currentPage - 1) * WALLPAPERS_PER_PAGE;
    const endIndex = startIndex + WALLPAPERS_PER_PAGE;
    return wallpapers.slice(startIndex, endIndex);
  }, [wallpapers, currentPage, WALLPAPERS_PER_PAGE]);

  // Calculate total pages
  const totalPages = Math.ceil(wallpapers.length / WALLPAPERS_PER_PAGE);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', page.toString());
    }
    setSearchParams(newSearchParams);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCategoryData();
    fetchWallpapers();
  }, [filters, fetchWallpapers, fetchCategoryData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      handlePageChange(1);
    }
  }, [filters, categoryFilter]);

  // Listen for NSFW setting changes and user authentication
  useEffect(() => {
    const handleStorageChange = () => {
      // Only allow NSFW if user is logged in
      const newNsfwEnabled = user ? localStorage.getItem("nsfw-enabled") === "true" : false;
      setNsfwEnabled(newNsfwEnabled);
    };

    // Listen for storage events (when changed in another tab/window)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes in the same tab
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Update NSFW setting when user authentication changes
  useEffect(() => {
    setNsfwEnabled(user ? localStorage.getItem("nsfw-enabled") === "true" : false);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="mb-4">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            {/* Page Heading */}
            <div className="flex-1">
              {categoryLoading && categoryFilter ? (
                <CategoryHeadingSkeleton />
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
                    {categoryData ? categoryData.name : (categoryFilter || 'Waifu Gallery')}
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    {categoryData?.description || 
                      (categoryFilter 
                        ? `Discover amazing ${categoryFilter.toLowerCase()} waifus with beautiful artwork and captivating designs`
                        : 'Discover beautiful anime waifus featuring stunning artwork and captivating character designs'
                      )
                    }
                  </p>
                </>
              )}
            </div>
            
            {/* Filter Section */}
            <div className="flex-shrink-0">
              <FilterSection 
                filters={filters} 
                onFiltersChange={updateFilters} 
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading wallpapers..." />
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No wallpapers yet. Be the first to upload!
            </p>
          </div>
        ) : (
          <div className="animate-fade-in animate-slide-up space-y-8">
            {/* Results info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * WALLPAPERS_PER_PAGE) + 1}-{Math.min(currentPage * WALLPAPERS_PER_PAGE, wallpapers.length)} of {wallpapers.length} wallpapers
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>

            {filters.view === 'list' ? (
              <WallpaperGrid wallpapers={paginatedWallpapers} />
            ) : (
              <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border/40">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Preview</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Character</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Tags</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedWallpapers.map((wallpaper) => (
                        <tr key={wallpaper.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <img 
                              src={wallpaper.imageUrl} 
                              alt={wallpaper.title}
                              className="w-16 h-10 object-cover rounded-md shadow-sm"
                            />
                          </td>
                          <td className="p-4 font-medium text-foreground">{wallpaper.title}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                              {wallpaper.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 flex-wrap max-w-48">
                              {wallpaper.tags.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs border ${getTagColor(tag)}`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {wallpaper.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-muted">
                                  +{wallpaper.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {new Date(wallpaper.uploadedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wallpapers;
