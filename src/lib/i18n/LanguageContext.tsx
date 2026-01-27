import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'en' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('wakilni-language') as Language;
    if (stored && (stored === 'en' || stored === 'ar')) {
      return stored;
    }
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ar')) {
      return 'ar';
    }
    return defaultLanguage;
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const t = translations[language];

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('wakilni-language', lang);
  };

  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for bilingual content
export function useBilingualText(enText: string | undefined, arText: string | undefined): string {
  const { language } = useLanguage();
  if (language === 'ar' && arText) {
    return arText;
  }
  return enText || arText || '';
}
