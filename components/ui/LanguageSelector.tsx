// components/widget/ui/LanguageSelector.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
 import * as Flags from 'country-flag-icons/react/3x2';

interface Language {
  code: string;
  name: string;
  countryCode: keyof typeof Flags; // مثلاً "IR", "US", "SA"
}

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
}

export default function LanguageSelector({
  languages,
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const currentLang = languages.find((lang) => lang.code === selectedLanguage);

  const handleLanguageSelect = (code: string) => {
    onLanguageChange(code);
    setShowMenu(false);
  };

  const renderFlag = (countryCode: keyof typeof Flags) => {
    const FlagComponent = Flags[countryCode];
    if (!FlagComponent) return null;
    
    return (
      <FlagComponent 
        className="rounded-sm" 
        style={{ width: '20px', height: '16px' }}
      />
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="  p-2 rounded-xl border border-white/[0.06]
  transition-colors
  active:scale-[0.96] active:transition-transform"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="Select language"
      >
        {currentLang && renderFlag(currentLang.countryCode)}
       </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden shadow-2xl min-w-[140px] z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full px-3 py-2.5 flex items-center gap-2.5 transition-colors ${
                  selectedLanguage === lang.code
                    ? "bg-blue-500/30 text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {renderFlag(lang.countryCode)}
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
