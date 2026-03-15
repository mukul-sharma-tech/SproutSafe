import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "en" | "hi";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const value = { lang, setLang: useCallback((l: Lang) => setLang(l), []) };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { lang: "en" as Lang, setLang: () => {} };
  }
  return ctx;
}
