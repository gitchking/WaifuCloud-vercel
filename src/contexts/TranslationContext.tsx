import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  LANGUAGES, 
  LanguageName, 
  LanguageCode, 
  translateText, 
  translateBatch, 
  BASE_CONTENT,
  getAllTranslatableContent 
} from '@/utils/translator';

interface TranslationContextType {
  currentLanguage: LanguageCode;
  currentLanguageName: LanguageName;
  setLanguage: (language: LanguageName) => void;
  t: (text: string) => string;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get current language name from code
  const currentLanguageName = Object.entries(LANGUAGES).find(
    ([, code]) => code === currentLanguage
  )?.[0] as LanguageName || 'English';

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as LanguageCode;
    if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslations({});
      return;
    }

    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadTranslations = async (languageCode: LanguageCode) => {
    setIsLoading(true);
    
    try {
      // Check if we have cached translations for this language
      const cacheKey = `translations_${languageCode}`;
      const cachedTranslations = localStorage.getItem(cacheKey);
      
      if (cachedTranslations) {
        try {
          const parsed = JSON.parse(cachedTranslations);
          setTranslations(parsed);
          setIsLoading(false);
          return;
        } catch (error) {
          console.warn('Failed to parse cached translations');
        }
      }

      // Get all translatable content
      const allContent = getAllTranslatableContent();
      
      // Translate in batches
      console.log(`Loading translations for ${languageCode}...`);
      const translatedContent = await translateBatch(allContent, languageCode);
      
      // Cache the translations
      localStorage.setItem(cacheKey, JSON.stringify(translatedContent));
      setTranslations(translatedContent);
      
      console.log(`Translations loaded for ${languageCode}`);
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations({});
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (languageName: LanguageName) => {
    const languageCode = LANGUAGES[languageName];
    setCurrentLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
  };

  // Translation function
  const t = (text: string): string => {
    if (currentLanguage === 'en') {
      return text;
    }
    
    return translations[text] || text;
  };

  return (
    <TranslationContext.Provider
      value={{
        currentLanguage,
        currentLanguageName,
        setLanguage,
        t,
        isLoading,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};