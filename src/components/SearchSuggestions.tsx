import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchSuggestionsProps {
  searchQuery: string;
  onSuggestionClick: (suggestion: string) => void;
}

export const SearchSuggestions = ({ searchQuery, onSuggestionClick }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      // Get categories that match the search
      const { data: categories } = await supabase
        .from("categories")
        .select("name")
        .ilike("name", `%${searchQuery}%`)
        .eq("is_active", true)
        .limit(5);

      // Get popular tags that match the search
      const { data: wallpapers } = await supabase
        .from("wallpapers")
        .select("tags")
        .limit(100);

      const allTags = new Set<string>();
      wallpapers?.forEach(w => {
        w.tags?.forEach((tag: string) => {
          if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
            allTags.add(tag);
          }
        });
      });

      const tagSuggestions = Array.from(allTags).slice(0, 5);
      const categorySuggestions = categories?.map(c => c.name) || [];
      
      // Combine and deduplicate suggestions
      const allSuggestions = [...categorySuggestions, ...tagSuggestions];
      const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 8);
      
      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, fetchSuggestions]);

  if (!searchQuery || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 p-3">
      <div className="text-xs text-muted-foreground mb-2">Suggestions:</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <span
            key={index}
            className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  );
};