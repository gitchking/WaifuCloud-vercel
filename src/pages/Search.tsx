import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WallpaperGrid } from "@/components/WallpaperGrid";
import { FilterSection } from "@/components/FilterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Pagination } from "@/components/Pagination";
import { useSearch } from "@/contexts/SearchContext";
import { useFilters } from "@/hooks/useFilters";
import { Search as SearchIcon, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

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

const Search = () => {
  const { searchQuery, searchResults, isSearching, hasSearched, clearSearch } = useSearch();
  const { filters, updateFilters } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination constants
  const WALLPAPERS_PER_ROW = 4;
  const ROWS_PER_PAGE = 4;
  const WALLPAPERS_PER_PAGE = WALLPAPERS_PER_ROW * ROWS_PER_PAGE;

  // Apply filters and sorting to search results
  const filteredResults = useMemo(() => {
    let results = [...searchResults];

    // Apply device filter based on orientation
    if (filters.device === 'desktop') {
      results = results.filter(w => w.orientation === 'horizontal' || !w.orientation);
    } else if (filters.device === 'phone') {
      results = results.filter(w => w.orientation === 'vertical');
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (filters.sort) {
        case 'latest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'trending':
          // For search results, we can use relevance as "trending"
          const aScore = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1;
          const bScore = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1;
          return bScore - aScore;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return results;
  }, [searchResults, filters, searchQuery]);

  // Get unique categories from results
  const categories = [...new Set(searchResults.map(w => w.category))];

  // Calculate paginated results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * WALLPAPERS_PER_PAGE;
    const endIndex = startIndex + WALLPAPERS_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage, WALLPAPERS_PER_PAGE]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredResults.length / WALLPAPERS_PER_PAGE);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              {/* Page Heading */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
                  Search Results
                </h1>
                {hasSearched && (
                  <p className="text-muted-foreground text-sm">
                    {isSearching ? (
                      "Searching..."
                    ) : searchQuery ? (
                      <>
                        {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "
                        <span className="font-medium text-foreground">{searchQuery}</span>"
                      </>
                    ) : (
                      "Enter a search term to find waifus"
                    )}
                  </p>
                )}
                
                {/* Search Query Display */}
                {searchQuery && (
                  <div className="flex items-center gap-2 mt-2">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-sm">
                      {searchQuery}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Filter Section */}
              {hasSearched && searchResults.length > 0 && (
                <div className="flex-shrink-0">
                  <FilterSection 
                    filters={filters} 
                    onFiltersChange={updateFilters} 
                  />
                </div>
              )}
            </div>
          </div>



          {/* Search Suggestions */}
          {!hasSearched && (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Search Waifus</h2>
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                Find waifus by character name, tags, series, or artist credit
              </p>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Popular searches:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['anime', 'cute', 'colorful', 'girl', 'fantasy', 'nature'].map(term => (
                      <Badge
                        key={term}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => {
                          // This would trigger a search
                          window.dispatchEvent(new CustomEvent('performSearch', { detail: term }));
                        }}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Searching waifus..." />
            </div>
          )}

          {/* No Results */}
          {hasSearched && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6">
                Try different keywords or check your spelling
              </p>
              
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-medium mb-2">Search tips:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Try broader terms like "anime" or "cute"</li>
                  <li>• Search by category like "fantasy" or "nature"</li>
                  <li>• Look for specific tags like "girl" or "colorful"</li>
                  <li>• Check artist credits or wallpaper titles</li>
                </ul>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {hasSearched && !isSearching && filteredResults.length > 0 && (
            <div className="space-y-6">
              {/* Categories found */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Categories found:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Results info */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * WALLPAPERS_PER_PAGE) + 1}-{Math.min(currentPage * WALLPAPERS_PER_PAGE, filteredResults.length)} of {filteredResults.length} results
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>

              {/* Wallpaper Grid with same view options as main page */}
              <div className="animate-fade-in animate-slide-up">
                {filters.view === 'list' ? (
                  <WallpaperGrid wallpapers={paginatedResults} />
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
                          {paginatedResults.map((wallpaper) => (
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
              </div>

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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;