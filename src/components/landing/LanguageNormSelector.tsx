"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

const locales = {
  es: {
    flag: "🇨🇴",
    label: "ES",
    name: "Español",
  },
  en: {
    flag: "🇺🇸",
    label: "EN",
    name: "English",
  },
};

export default function LanguageNormSelector() {
  const [locale, setLocale] = useState<"es" | "en">("es");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    if (saved === "es" || saved === "en") {
      setLocale(saved as "es" | "en");
    }
  }, []);

  const changeLocale = (newLocale: "es" | "en") => {
    setLocale(newLocale);
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent("locale-change", { detail: { locale: newLocale } }));
    }
  };

  const current = locales[locale];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-lg">{current.flag}</span>
        <span className="font-bold">{current.label}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50 w-40 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {Object.entries(locales).map(([code, info]) => (
              <button
                key={code}
                onClick={() => changeLocale(code as "es" | "en")}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  locale === code
                    ? "bg-primary/10 font-bold text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{info.flag}</span>
                <span>{info.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}