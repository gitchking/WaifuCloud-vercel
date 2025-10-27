// Free translation utility using MyMemory API (no key required)
export const LANGUAGES = {
  'English': 'en',
  '简体中文': 'zh-cn',
  'हिन्दी': 'hi',
  'Español': 'es',
  'Français': 'fr',
  'العربية': 'ar',
  'Português': 'pt',
  'বাংলা': 'bn',
  'Русский': 'ru',
  'اردو': 'ur',
  'Bahasa Indonesia': 'id',
  'فارسی': 'fa',
  'Deutsch': 'de',
  '日本語': 'ja',
  'Türkçe': 'tr',
  'Tiếng Việt': 'vi',
  'தமிழ்': 'ta',
  'Italiano': 'it'
} as const;

export type LanguageName = keyof typeof LANGUAGES;
export type LanguageCode = typeof LANGUAGES[LanguageName];

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

// Base English text content for the application
export const BASE_CONTENT = {
  // Header
  'Waifu Cloud': 'Waifu Cloud',
  'Waifus': 'Waifus',
  'Categories': 'Categories',
  'Favourites': 'Favourites',
  'Upload': 'Upload',
  'Login': 'Login',
  'Logout': 'Logout',
  'Profile': 'Profile',
  'Dashboard': 'Dashboard',
  'Settings': 'Settings',
  'Admin Panel': 'Admin Panel',
  'Search waifus, tags, categories...': 'Search waifus, tags, categories...',
  
  // Common
  'Search': 'Search',
  'Loading': 'Loading',
  'Error': 'Error',
  'Save': 'Save',
  'Cancel': 'Cancel',
  'Delete': 'Delete',
  'Edit': 'Edit',
  'Download': 'Download',
  'Share': 'Share',
  'Clear': 'Clear',
  'Back': 'Back',
  'Close': 'Close',
  
  // Pages
  'Anime Wallpapers': 'Anime Wallpapers',
  'Explore high-quality anime wallpapers featuring stunning designs and vibrant colors': 'Explore high-quality anime wallpapers featuring stunning designs and vibrant colors',
  'Browse wallpapers by your favorite categories': 'Browse wallpapers by your favorite categories',
  'Search Results': 'Search Results',
  'Upload Wallpaper': 'Upload Wallpaper',
  'Share your amazing anime wallpapers with the community': 'Share your amazing anime wallpapers with the community',
  
  // Forms
  'Title': 'Title',
  'Category': 'Category',
  'Tags': 'Tags',
  'Credit': 'Credit',
  'Image': 'Image',
  'Preview': 'Preview',
  'Auto Tag': 'Auto Tag',
  
  // Messages
  'Loading wallpapers...': 'Loading wallpapers...',
  'Loading categories...': 'Loading categories...',
  'No wallpapers yet. Be the first to upload!': 'No wallpapers yet. Be the first to upload!',
  'No categories available yet.': 'No categories available yet.',
  'Uploading...': 'Uploading...',
  'Generating...': 'Generating...',
  
  // Footer
  'About Us': 'About Us',
  'FAQ': 'FAQ',
  'DMCA': 'DMCA',
  'Copyright Policy': 'Copyright Policy',
  'Terms of Use': 'Terms of Use',
  'Privacy Policy': 'Privacy Policy',
  
  // Filters
  'Grid': 'Grid',
  'Table': 'Table',
  'Desktop': 'Desktop',
  'Phone': 'Phone',
  'Latest': 'Latest',
  'Trending': 'Trending'
};

// Free translation API using MyMemory (no key required)
export const translateText = async (text: string, targetLang: LanguageCode): Promise<string> => {
  if (targetLang === 'en') {
    return text;
  }

  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    // MyMemory API - free translation service
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    
    if (!response.ok) {
      throw new Error('Translation API failed');
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translatedText = data.responseData.translatedText;
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    }
    
    throw new Error('Invalid translation response');
  } catch (error) {
    console.warn(`Translation failed for "${text}" to ${targetLang}:`, error);
    
    // Fallback: try LibreTranslate API
    try {
      const fallbackResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.translatedText) {
          translationCache.set(cacheKey, fallbackData.translatedText);
          return fallbackData.translatedText;
        }
      }
    } catch (fallbackError) {
      console.warn('Fallback translation also failed:', fallbackError);
    }
    
    // Return original text if all translation attempts fail
    return text;
  }
};

// Batch translate multiple texts
export const translateBatch = async (texts: string[], targetLang: LanguageCode): Promise<Record<string, string>> => {
  const translations: Record<string, string> = {};
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(async (text) => {
      const translated = await translateText(text, targetLang);
      return { original: text, translated };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ original, translated }) => {
      translations[original] = translated;
    });
    
    // Small delay between batches to be respectful to free APIs
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return translations;
};

// Get all translatable content
export const getAllTranslatableContent = (): string[] => {
  return Object.values(BASE_CONTENT);
};