"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Locale } from "./i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "es",
  setLocale: () => {},
  t: (key: string, fallback?: string) => fallback ?? key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  // Leer locale inicial de localStorage (solo en cliente)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale");
      if (saved === "es" || saved === "en") {
        setLocaleState(saved as Locale);
      }
    } catch {
      // localStorage no disponible (SSR o entorno restringido)
    }
  }, []);

  // Escuchar el evento locale-change que dispara LanguageNormSelector
  useEffect(() => {
    const handleLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.locale === "es" || detail?.locale === "en") {
        setLocaleState(detail.locale as Locale);
      }
    };

    window.addEventListener("locale-change", handleLocaleChange);
    return () => window.removeEventListener("locale-change", handleLocaleChange);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("locale", newLocale);
    } catch {
      // ignorar
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[locale] || translations.es;
      const value = dict[key as keyof typeof dict];
      if (typeof value === "string") return value;
      // Intentar con el español como fallback
      const esValue = translations.es[key as keyof typeof translations.es];
      if (typeof esValue === "string") return esValue;
      return fallback ?? key;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  return useContext(LocaleContext);
}

/** Hook de conveniencia: retorna solo la función t() */
export function useT() {
  const { t, locale } = useContext(LocaleContext);
  return { t, locale };
}
