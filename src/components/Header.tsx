import { Search, Upload, Settings, LogOut, Heart, Image, FolderOpen, User, Shield, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSearch } from "@/contexts/SearchContext";
import { useTranslation } from "@/contexts/TranslationContext";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { searchQuery, setSearchQuery, performSearch, clearSearch, isSearching } = useSearch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchAvatarUrl = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching avatar URL:", error);
        return;
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    // Update favourite count
    updateFavouriteCount();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateFavouriteCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]); // Add user dependency to update count when auth state changes

  useEffect(() => {
    if (user) {
      fetchAvatarUrl();
    }
  }, [user, fetchAvatarUrl]);

  useEffect(() => {
    // Listen for avatar updates from the Profile component
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Update favourite count when NSFW settings change
  useEffect(() => {
    const handleNSFWChange = () => {
      updateFavouriteCount();
    };

    // Check for NSFW setting changes periodically
    const interval = setInterval(handleNSFWChange, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const updateFavouriteCount = async () => {
    try {
      const savedWallpapers = JSON.parse(localStorage.getItem('favouriteWallpapers') || '[]');
      
      if (savedWallpapers.length === 0) {
        setFavouriteCount(0);
        return;
      }

      // Fetch the actual wallpapers to apply NSFW filtering
      const { data, error } = await supabase
        .from("wallpapers")
        .select("id, is_nsfw")
        .in("id", savedWallpapers);

      if (error) {
        console.error("Error fetching favourite wallpapers for count:", error);
        setFavouriteCount(savedWallpapers.length); // Fallback to raw count
        return;
      }

      // Apply NSFW filtering - same logic as Favourites page
      const nsfwEnabled = user ? localStorage.getItem("nsfw-enabled") === "true" : false;
      
      const filteredWallpapers = data.filter((wallpaper) => {
        // Only show NSFW content to logged-in users who have enabled it
        if (wallpaper.is_nsfw && (!user || !nsfwEnabled)) {
          return false;
        }
        return true;
      });

      setFavouriteCount(filteredWallpapers.length);
    } catch (error) {
      console.error("Error updating favourite count:", error);
      setFavouriteCount(0);
    }
  };

  const setThemeAndStore = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Get search suggestions from popular tags and categories
  const getSearchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      console.log('Getting suggestions for:', query);
      
      // Get popular tags and categories that match the query
      const { data: wallpapers } = await supabase
        .from('wallpapers')
        .select('tags, category, title')
        .limit(100);

      if (wallpapers) {
        const allSuggestions = new Set<string>();
        const queryLower = query.toLowerCase();
        
        wallpapers.forEach(wallpaper => {
          // Add matching categories
          if (wallpaper.category && wallpaper.category.toLowerCase().includes(queryLower)) {
            allSuggestions.add(wallpaper.category);
          }
          
          // Add matching tags
          if (wallpaper.tags && Array.isArray(wallpaper.tags)) {
            wallpaper.tags.forEach((tag: string) => {
              if (tag && tag.toLowerCase().includes(queryLower)) {
                allSuggestions.add(tag);
              }
            });
          }
          
          // Add matching title words
          if (wallpaper.title) {
            const titleWords = wallpaper.title.toLowerCase().split(' ');
            titleWords.forEach(word => {
              if (word.includes(queryLower) && word.length > 2) {
                allSuggestions.add(word);
              }
            });
          }
        });

        const suggestionArray = Array.from(allSuggestions).slice(0, 6);
        console.log('Generated suggestions:', suggestionArray);
        setSuggestions(suggestionArray);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      getSearchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = async (query?: string) => {
    const searchTerm = query || searchQuery;
    console.log('Submitting search for:', searchTerm);
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      await performSearch(searchTerm);
      navigate('/search');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearchSubmit(suggestion);
  };

  // Handle clear search
  const handleClearSearch = () => {
    clearSearch();
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <header className="w-full border-b border-border/40 bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://iili.io/K4Q2cZB.png" 
            alt="Waifu Cloud" 
            className="h-10 w-auto"
          />
          <span className="hidden sm:block text-2xl waifu-cloud-logo">
            <span className="waifu-text">Waifu</span>{" "}
            <span className="cloud-text">Cloud</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t("Search waifus, tags, categories...")}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchQuery.length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="pl-10 pr-10 bg-card border-border"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-3 w-3 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-3">
          <Link to="/" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-muted">
            <Image className="h-4 w-4" />
            <span>{t("Waifus")}</span>
          </Link>
          <Link to="/categories" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-muted">
            <FolderOpen className="h-4 w-4" />
            <span>{t("Categories")}</span>
          </Link>

          {user && (
            <Link to="/favourites" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-muted relative">
              <Heart className="h-4 w-4" />
              <span>{t("Favourites")}</span>
              {favouriteCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-1 -right-1">
                  {favouriteCount}
                </span>
              )}
            </Link>
          )}

          <div className="flex items-center ml-2">
            <Label htmlFor="theme-toggle" className="sr-only">
              Toggle theme
            </Label>
            <ThemeToggle theme={theme} onThemeChange={setThemeAndStore} />
          </div>

          {user && (
            <Link to="/upload">
              <Button
                size="sm"
                className="hidden md:flex gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                <span>{t("Upload")}</span>
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/favourites" className="md:hidden">
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full p-0">
                  <Heart className="h-4 w-4" />
                  {favouriteCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {favouriteCount}
                    </span>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-background">
                      <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.full_name || user.email || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.user_metadata?.full_name ?
                          user.user_metadata.full_name.charAt(0).toUpperCase() :
                          user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to="/profile">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/settings">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin">
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};