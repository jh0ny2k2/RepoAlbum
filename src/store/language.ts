import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKey } from '@/i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en', // Default to English
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        return translations[lang][key] || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
