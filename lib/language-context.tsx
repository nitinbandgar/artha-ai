"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Language = {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
};

export const LANGUAGES: Language[] = [
  { code: "en-IN", label: "English",  nativeLabel: "English",    flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi",    nativeLabel: "हिंदी",       flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi",  nativeLabel: "मराठी",       flag: "🇮🇳" },
  { code: "ta-IN", label: "Tamil",    nativeLabel: "தமிழ்",       flag: "🇮🇳" },
  { code: "te-IN", label: "Telugu",   nativeLabel: "తెలుగు",      flag: "🇮🇳" },
  { code: "bn-IN", label: "Bengali",  nativeLabel: "বাংলা",       flag: "🇮🇳" },
];

type LanguageContextType = {
  language: Language;
  setLanguage: (l: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: LANGUAGES[0],
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
