// Additional free APIs for enhanced tagging
export interface APITagResult {
  tags: string[];
  source: string;
  confidence: number;
}

// Use Unsplash's free API for similar image tags (no key required for basic usage)
export const getUnsplashTags = async (searchTerm: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=5`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const tags: string[] = [];
      
      data.results?.forEach((photo: any) => {
        if (photo.tags) {
          photo.tags.forEach((tag: any) => {
            if (tag.title && tag.title.length > 2) {
              tags.push(tag.title.toLowerCase());
            }
          });
        }
        if (photo.description) {
          // Extract keywords from description
          const words = photo.description.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((word: string) => word.length > 3);
          tags.push(...words.slice(0, 3));
        }
      });
      
      return [...new Set(tags)].slice(0, 8);
    }
  } catch (error) {
    console.log('Unsplash API not available');
  }
  return [];
};

// Use JSONPlaceholder or similar for text analysis (mock implementation)
export const getTextAnalysisTags = async (text: string): Promise<string[]> => {
  try {
    // This is a mock implementation. In production, you could use:
    // - TextRazor API (free tier)
    // - MeaningCloud API (free tier)
    // - IBM Watson Natural Language Understanding (free tier)
    
    const keywords = extractAdvancedKeywords(text);
    const synonyms = await getSynonyms(keywords);
    
    return [...keywords, ...synonyms].slice(0, 6);
  } catch (error) {
    console.log('Text analysis failed');
    return [];
  }
};

// Advanced keyword extraction
const extractAdvancedKeywords = (text: string): string[] => {
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.includes(word) &&
      !word.match(/^\d+$/) // Remove pure numbers
    );
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
};

// Get synonyms using a free API or local mapping
const getSynonyms = async (keywords: string[]): Promise<string[]> => {
  const synonymMap: Record<string, string[]> = {
    'girl': ['female', 'woman', 'lady'],
    'boy': ['male', 'man', 'guy'],
    'cute': ['adorable', 'kawaii', 'sweet'],
    'beautiful': ['gorgeous', 'stunning', 'lovely'],
    'dark': ['shadow', 'noir', 'mysterious'],
    'bright': ['luminous', 'radiant', 'glowing'],
    'colorful': ['vibrant', 'vivid', 'rainbow'],
    'anime': ['manga', 'japanese animation', 'otaku'],
    'art': ['artwork', 'illustration', 'drawing'],
    'fantasy': ['magical', 'mystical', 'enchanted'],
    'city': ['urban', 'metropolitan', 'cityscape'],
    'nature': ['natural', 'outdoor', 'landscape']
  };
  
  const synonyms: string[] = [];
  keywords.forEach(keyword => {
    if (synonymMap[keyword]) {
      synonyms.push(...synonymMap[keyword].slice(0, 2));
    }
  });
  
  return synonyms;
};

// Use free color palette APIs
export const getColorPaletteTags = async (imageFile: File): Promise<string[]> => {
  try {
    // This could integrate with:
    // - Colormind API (free)
    // - Adobe Color API (free tier)
    // - Or use local canvas analysis (which we already have)
    
    return await analyzeColorPalette(imageFile);
  } catch (error) {
    console.log('Color palette analysis failed');
    return [];
  }
};

const analyzeColorPalette = async (imageFile: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 50;
      canvas.height = 50;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, 50, 50);
        
        try {
          const imageData = ctx.getImageData(0, 0, 50, 50);
          const data = imageData.data;
          
          const colors: Array<{r: number, g: number, b: number, count: number}> = [];
          
          // Sample colors
          for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Find similar color or add new one
            const similar = colors.find(color => 
              Math.abs(color.r - r) < 30 &&
              Math.abs(color.g - g) < 30 &&
              Math.abs(color.b - b) < 30
            );
            
            if (similar) {
              similar.count++;
            } else {
              colors.push({r, g, b, count: 1});
            }
          }
          
          // Sort by frequency and convert to color names
          const dominantColors = colors
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(color => rgbToColorName(color.r, color.g, color.b));
          
          resolve([...new Set(dominantColors)]);
        } catch (error) {
          resolve(['multicolor']);
        }
      } else {
        resolve(['multicolor']);
      }
    };
    
    img.onerror = () => resolve(['multicolor']);
    img.src = URL.createObjectURL(imageFile);
  });
};

// Convert RGB to color name
const rgbToColorName = (r: number, g: number, b: number): string => {
  const hsl = rgbToHsl(r, g, b);
  const hue = hsl[0];
  const saturation = hsl[1];
  const lightness = hsl[2];
  
  if (saturation < 0.1) {
    if (lightness > 0.9) return 'white';
    if (lightness < 0.1) return 'black';
    return 'gray';
  }
  
  if (hue < 15 || hue > 345) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 75) return 'yellow';
  if (hue < 150) return 'green';
  if (hue < 210) return 'cyan';
  if (hue < 270) return 'blue';
  if (hue < 330) return 'purple';
  return 'pink';
};

// RGB to HSL conversion
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return [h * 360, s, l];
};

// Combine all free API sources
export const getAllFreeTags = async (
  imageFile: File,
  title: string,
  category: string
): Promise<APITagResult[]> => {
  const results: APITagResult[] = [];
  
  // Try multiple free APIs in parallel
  const promises = [
    getUnsplashTags(title + ' ' + category).then(tags => ({
      tags,
      source: 'Unsplash API',
      confidence: 0.7
    })),
    getTextAnalysisTags(title + ' ' + category).then(tags => ({
      tags,
      source: 'Text Analysis',
      confidence: 0.8
    })),
    getColorPaletteTags(imageFile).then(tags => ({
      tags,
      source: 'Color Palette',
      confidence: 0.6
    }))
  ];
  
  const settled = await Promise.allSettled(promises);
  
  settled.forEach(result => {
    if (result.status === 'fulfilled' && result.value.tags.length > 0) {
      results.push(result.value);
    }
  });
  
  return results;
};