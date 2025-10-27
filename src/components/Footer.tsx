import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { LanguageName } from "@/utils/translator";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, setLanguage, currentLanguageName, isLoading } = useTranslation();

  const footerLinks = {
    main: [
      { label: "About Us", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "DMCA", href: "/dmca" },
      { label: "Copyright Policy", href: "/copyright-policy" },
      { label: "Terms of Use", href: "/terms-of-use" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
    languages: [
      "English", "简体中文", "हिन्दी", "Español", "Français", "العربية",
      "Português", "বাংলা", "Русский", "اردو", "Bahasa Indonesia", "فارسی",
      "Deutsch", "日本語", "Türkçe", "Tiếng Việt", "தமিழ்", "Italiano",
    ] as LanguageName[],
  };

  const handleLanguageChange = (language: LanguageName) => {
    setLanguage(language);
  };

  return (
    <footer className="w-full border-t border-border/40 bg-card mt-auto">
      <div className="container px-4 md:px-8 py-8">
        {/* Logo and Copyright */}
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="https://iili.io/K4Q2cZB.png" 
            alt="Waifu Cloud" 
            className="h-8 w-auto"
          />
          <div className="flex flex-col">
            <span className="text-lg waifu-cloud-logo">
              <span className="waifu-theme-color">Waifu</span>{" "}
              <span className="text-foreground">Cloud</span>
            </span>
            <span className="text-xs text-muted-foreground">© {currentYear} Waifu Cloud</span>
          </div>
        </div>

        {/* Main Links */}
        <div className="flex flex-wrap gap-4 mb-6">
          {footerLinks.main.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              {t(link.label)}
            </Link>
          ))}
        </div>

        {/* Translation Loading Indicator */}
        {isLoading && (
          <div className="mb-4 text-sm text-muted-foreground">
            Loading translations...
          </div>
        )}

        {/* Language Links - These should NOT be translated */}
        <div className="flex flex-wrap gap-3">
          {footerLinks.languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`text-sm transition-colors ${
                currentLanguageName === lang 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
              disabled={isLoading}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};
