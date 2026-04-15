"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import RiveAvatar from './ui/RiveAvatar';
// import RiveButtonWrapper from './ui/RiveButtonWrapper';
import { TranslationKey, translations } from '@/utils/translations';

interface WidgetButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export default function WidgetButton({
  onClick,
  isOpen = false,
}: WidgetButtonProps) {
  // const showFullScreenCTA = process.env.NEXT_PUBLIC_SHOW_WIDGET_CTA === "true";
  // const avatarImageUrl = process.env.NEXT_PUBLIC_AVATAR_IMAGE_URL;

  // Get default language from env or use 'de' as fallback
  const defaultLanguage = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE as TranslationKey) || "de";
  // const t = translations[defaultLanguage] || translations.de;

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="full-screen-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={onClick} 
          className="fixed inset-0 w-full h-[100dvh] z-50 flex flex-col bg-slate-50 overflow-hidden cursor-pointer font-sans antialiased touch-manipulation safe-area-top safe-area-bottom" 
        >
       
          {/* ✨ BACKGROUND BLOBS (Alive, Breathing) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-drift" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none mix-blend-multiply animate-drift" style={{ animationDelay: '-8s' }} />
          <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none mix-blend-multiply animate-drift" style={{ animationDelay: '-15s' }} />

          {/* --- Main Content Wrapper --- */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center pb-12 md:pb-16 px-4">
             {/* محتوای اصلی شما در اینجا قرار می‌گیرد */}
          </div>

          {/* ✅ متن متمرکز، تایپوگرافی مدرن (Apple-esque) و زیرنویس */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col items-center justify-center pointer-events-none select-none text-center w-full px-6"
          >
            {/* متن اصلی با استایل مدرن */}
            <h1 className="text-slate-900 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter drop-shadow-sm">
              Click anywhere to enter
            </h1>
            
            {/* متن راهنما برای محتوای آینده */}
            <p className="mt-4 md:mt-5 text-slate-500/80 text-lg md:text-xl font-medium tracking-wide max-w-lg leading-relaxed">
[ Space reserved for promotional video or content ]            </p>
          </div>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
