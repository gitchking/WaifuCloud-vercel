import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface TagSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Comprehensive tag database for anime wallpapers
const TAG_DATABASE = [
  // Anime/Manga
  'anime', 'manga', 'otaku', 'kawaii', 'chibi', 'shounen', 'shoujo', 'seinen', 'josei',
  'mecha', 'magical girl', 'slice of life', 'romance', 'action', 'adventure', 'fantasy',
  'supernatural', 'school life', 'comedy', 'drama', 'horror', 'mystery', 'thriller',
  
  // Characters
  'girl', 'boy', 'female', 'male', 'character', 'protagonist', 'heroine', 'hero',
  'student', 'teacher', 'warrior', 'mage', 'knight', 'princess', 'demon', 'angel',
  'cat girl', 'fox girl', 'elf', 'vampire', 'witch', 'ninja', 'samurai', 'pirate',
  
  // Appearance
  'cute', 'beautiful', 'gorgeous', 'adorable', 'pretty', 'handsome', 'cool', 'sexy',
  'elegant', 'graceful', 'mysterious', 'fierce', 'gentle', 'sweet', 'innocent',
  'long hair', 'short hair', 'twin tails', 'ponytail', 'braids', 'blonde', 'brunette',
  'redhead', 'black hair', 'white hair', 'blue hair', 'pink hair', 'purple hair',
  
  // Colors
  'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white',
  'gray', 'brown', 'cyan', 'magenta', 'gold', 'silver', 'rainbow', 'multicolor',
  'colorful', 'vibrant', 'pastel', 'neon', 'bright', 'dark', 'light', 'monochrome',
  'gradient', 'warm colors', 'cool colors', 'earth tones',
  
  // Art Style
  'digital art', 'illustration', 'artwork', 'painting', 'drawing', 'sketch',
  'realistic', 'stylized', 'minimalist', 'detailed', 'high quality', 'HD', '4K',
  'portrait', 'full body', 'close up', 'profile', 'front view', 'side view',
  'cel shading', 'soft shading', 'hard shadows', 'anime style', 'manga style',
  
  // Mood/Atmosphere
  'peaceful', 'serene', 'calm', 'relaxing', 'energetic', 'dynamic', 'intense',
  'dramatic', 'emotional', 'melancholic', 'cheerful', 'happy', 'sad', 'angry',
  'mysterious', 'dreamy', 'nostalgic', 'romantic', 'epic', 'majestic', 'ethereal',
  
  // Settings/Backgrounds
  'school', 'classroom', 'library', 'cafe', 'park', 'beach', 'forest', 'mountain',
  'city', 'urban', 'rural', 'countryside', 'village', 'castle', 'palace', 'temple',
  'shrine', 'garden', 'field', 'sky', 'clouds', 'sunset', 'sunrise', 'night',
  'stars', 'moon', 'space', 'galaxy', 'underwater', 'indoor', 'outdoor',
  
  // Seasons/Weather
  'spring', 'summer', 'autumn', 'winter', 'cherry blossom', 'sakura', 'snow',
  'rain', 'storm', 'sunshine', 'cloudy', 'foggy', 'windy', 'festival', 'hanami',
  
  // Objects/Items
  'sword', 'katana', 'magic', 'spell', 'book', 'flower', 'rose', 'lily', 'butterfly',
  'cat', 'dog', 'dragon', 'phoenix', 'wings', 'crown', 'jewelry', 'uniform',
  'kimono', 'dress', 'armor', 'weapon', 'staff', 'wand', 'crystal', 'gem',
  
  // Genres/Themes
  'fantasy', 'sci-fi', 'cyberpunk', 'steampunk', 'medieval', 'modern', 'futuristic',
  'post apocalyptic', 'dystopian', 'utopian', 'alternate reality', 'time travel',
  'parallel world', 'isekai', 'virtual reality', 'game world',
  
  // Technical
  'wallpaper', 'background', 'desktop', 'mobile', 'phone', 'tablet', 'widescreen',
  'vertical', 'horizontal', 'landscape', 'portrait orientation', 'aspect ratio',
  'resolution', 'quality', 'compressed', 'uncompressed', 'vector', 'raster',
  
  // Popular Series (Generic)
  'shounen anime', 'shoujo anime', 'magical girl anime', 'mecha anime', 'isekai anime',
  'slice of life anime', 'romance anime', 'action anime', 'adventure anime',
  'fantasy anime', 'sci-fi anime', 'horror anime', 'comedy anime', 'drama anime'
];

export const TagSuggestions = ({ value, onChange, placeholder, className }: TagSuggestionsProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Parse existing tags
  const existingTags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  
  // Get current tag being typed (last incomplete tag)
  const getCurrentTag = () => {
    const lastCommaIndex = inputValue.lastIndexOf(',');
    return lastCommaIndex === -1 ? inputValue.trim() : inputValue.slice(lastCommaIndex + 1).trim();
  };

  // Update suggestions based on current input
  useEffect(() => {
    const currentTag = getCurrentTag();
    
    if (currentTag.length >= 2) {
      const filtered = TAG_DATABASE
        .filter(tag => 
          tag.toLowerCase().includes(currentTag.toLowerCase()) &&
          !existingTags.some(existing => existing.toLowerCase() === tag.toLowerCase())
        )
        .slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Update the main value
    onChange(newValue);
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    const lastCommaIndex = inputValue.lastIndexOf(',');
    let newValue: string;
    
    if (lastCommaIndex === -1) {
      // Replace entire input
      newValue = suggestion + ', ';
    } else {
      // Replace only the current tag
      newValue = inputValue.slice(0, lastCommaIndex + 1) + ' ' + suggestion + ', ';
    }
    
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    const newTags = existingTags.filter(tag => tag !== tagToRemove);
    const newValue = newTags.join(', ') + (newTags.length > 0 ? ', ' : '');
    setInputValue(newValue);
    onChange(newValue);
  };

  // Add popular tags quickly
  const addPopularTag = (tag: string) => {
    if (!existingTags.some(existing => existing.toLowerCase() === tag.toLowerCase())) {
      const newValue = value + (value && !value.endsWith(', ') ? ', ' : '') + tag + ', ';
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  const popularTags = ['anime', 'cute', 'colorful', 'beautiful', 'digital art', 'kawaii', 'girl', 'fantasy'];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Existing tags display */}
      {existingTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingTags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            const currentTag = getCurrentTag();
            if (currentTag.length >= 2) {
              setShowSuggestions(suggestions.length > 0);
            }
          }}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder || "Type tags separated by commas..."}
          className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular tags */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Popular tags:</p>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addPopularTag(tag)}
              disabled={existingTags.some(existing => existing.toLowerCase() === tag.toLowerCase())}
            >
              <Plus className="h-3 w-3 mr-1" />
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};