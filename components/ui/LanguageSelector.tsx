"use client";
import { useState } from "react";
import { useLanguage, LANGUAGES } from "@/lib/language-context";
import { ChevronDown, Check } from "lucide-react";

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 ${
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
      >
        <span>{language.flag}</span>
        <span>{compact ? language.nativeLabel : language.label}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden min-w-[160px]">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
              >
                <span className="text-base">{lang.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{lang.nativeLabel}</p>
                  <p className="text-xs text-gray-400">{lang.label}</p>
                </div>
                {language.code === lang.code && (
                  <Check size={14} className="text-indigo-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
