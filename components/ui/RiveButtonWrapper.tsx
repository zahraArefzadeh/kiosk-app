'use client';

import React, { useEffect, useState } from 'react';
import { useRive, Layout, Fit, Alignment } from 'rive-react';
import Image from 'next/image';

interface RiveButtonWrapperProps {
  isVisible: boolean;
  onClick: () => void;
  avatarImageUrl?: string; // اضافه کردن پراپ اختیاری
}

export default function RiveButtonWrapper({ isVisible, onClick, avatarImageUrl }: RiveButtonWrapperProps) {
  const [remountKey, setRemountKey] = useState(0);

  // 🔄 Refresh logic logic only needs to run if we are using Rive
  useEffect(() => {
    if (avatarImageUrl) return; // اگر عکس داریم، نیازی به رفرش رایو نیست

    const interval = setInterval(() => {
      setRemountKey(prev => prev + 1);
    }, 180000); 

    return () => clearInterval(interval);
  }, [avatarImageUrl]);

  // فقط اگر عکس نداریم، هوک رایو را صدا می‌زنیم (یا همیشه صدا می‌زنیم ولی استفاده نمی‌کنیم)
  // نکته: هوک‌ها نباید در شرط باشند، پس همیشه اجرا می‌شود اما کنترل می‌کنیم.
  const { rive, RiveComponent } = useRive({
    src: process.env.NEXT_PUBLIC_rive || 'character_noLogo.riv',
    autoplay: true,
    stateMachines: 'StateMachine',
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  // Pause/Resume based on visibility (Only effective for Rive)
  useEffect(() => {
    if (avatarImageUrl || !rive) return;
    
    if (isVisible) {
      if (!rive.isPlaying) rive.play();
    } else {
      if (rive.isPlaying) rive.pause();
    }
  }, [isVisible, rive, avatarImageUrl]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-50 transition-all duration-300 
      ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <button
        onClick={onClick}
        className="w-24 h-24 lg:w-28 lg:h-28 bg-slate-600 rounded-full shadow-xl flex items-center justify-center 
                     hover:bg-blue-800 transition-all duration-300 overflow-hidden relative ring-2 ring-white/10"
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {avatarImageUrl ? (
          // --- Image Mode ---
          <div className="relative w-full h-full">
            <Image 
              src={avatarImageUrl} 
              alt="Assistant Avatar" 
              fill 
              sizes="(max-width: 768px) 96px, 112px"
              // object-cover: کل دایره را پر می‌کند
              // object-top: تمرکز را روی بالای عکس (صورت) می‌گذارد
              className="object-cover object-top"
              priority
            />
          </div>
        ) : (
          // --- Rive Mode ---
          <div key={remountKey} className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative z-10">
            <RiveComponent className="w-full h-full" />
          </div>
        )}
      </button>
    </div>
  );
}
