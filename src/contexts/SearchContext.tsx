import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wallpaper } from '@/types/wallpaper';
import { useAuth } from '@/contexts/AuthContext';

interface SearchContextType {
  searchQuery: string;
  searchResults: Wallpaper[];
  isSearching: boolean;
  hasSearched: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Wallpaper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Only allow NSFW content for logged-in users who have enabled it
      const nsfwEnabled = user ? localStorage.getItem("nsfw-enabled") === "true" : false;
      const searchTerm = query.trim().toLowerCase();

      console.log('Performing search for:', searchTerm);
      console.log('User logged in:', !!user, 'NSFW enabled:', nsfwEnabled);

      // Get ALL wallpapers first, then filter client-side
      // This is necessary because Supabase doesn't have good array search for tags
      let supabaseQuery = supabase
        .from('wallpapers')
        .select('*');

      // Apply NSFW filter - only show NSFW content to logged-in users who have enabled it
      if (!user || !nsfwEnabled) {
        supabaseQuery = supabaseQuery.eq('is_nsfw', false);
        console.log('Filtering out NSFW content - user not logged in or NSFW disabled');
      }

      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Retrieved wallpapers from database:', data?.length || 0);

      // Client-side filtering for comprehensive search
      const filteredResults = (data || []).filter(wallpaper => {
        const title = (wallpaper.title || '').toLowerCase();
        const category = (wallpaper.category || '').toLowerCase();
        const credit = (wallpaper.credit || '').toLowerCase();
        const tags = wallpaper.tags || [];

        // Check if search term matches title
        const titleMatch = title.includes(searchTerm);
        
        // Check if search term matches category
        const categoryMatch = category.includes(searchTerm);
        
        // Check if search term matches credit
        const creditMatch = credit.includes(searchTerm);
        
        // Check if search term matches any tag
        const tagMatch = tags.some((tag: string) => 
          tag.toLowerCase().includes(searchTerm)
        );

        const isMatch = titleMatch || categoryMatch || creditMatch || tagMatch;
        
        if (isMatch) {
          console.log('Match found:', {
            title: wallpaper.title,
            titleMatch,
            categoryMatch,
            creditMatch,
            tagMatch,
            tags: wallpaper.tags
          });
        }

        return isMatch;
      });

      console.log('Filtered results:', filteredResults.length);

      // Convert to our Wallpaper type
      const processedResults: Wallpaper[] = filteredResults
        .slice(0, 50) // Limit results for performance
        .map(w => ({
          id: w.id,
          title: w.title,
          imageUrl: w.image_url,
          image_url: w.image_url,
          tags: w.tags || [],
          category: w.category,
          isNSFW: w.is_nsfw,
          uploadedAt: w.created_at,
          created_at: w.created_at,
          credit: w.credit || undefined,
          orientation: w.orientation || "horizontal",
        }));

      setSearchResults(processedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      clearSearch();
    }
  }, [clearSearch]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        hasSearched,
        setSearchQuery: handleSetSearchQuery,
        performSearch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};