'use client';

import React, { useEffect, useState, memo } from 'react';
import { useRive, useStateMachineInput } from 'rive-react';

interface RivePanelWrapperProps {
  isSpeaking: boolean;
}

// ✅ کامپوننت داخلی برای Rive
const RiveAnimation = memo(({ 
  isSpeaking, 
  onReady 
}: { 
  isSpeaking: boolean;
  onReady?: () => void;
}) => {
  const { rive, RiveComponent } = useRive({
    src: process.env.NEXT_PUBLIC_rive || 'character_noLogo.riv',
    autoplay: true,
    stateMachines: 'StateMachine',
    artboard: 'Artboard',
  });

  const isSpeakingInput = useStateMachineInput(
    rive,
    'StateMachine',
    'isSpeaking'
  );

  // Update isSpeaking
  useEffect(() => {
    if (isSpeakingInput) {
      isSpeakingInput.value = isSpeaking;
    }
  }, [isSpeakingInput, isSpeaking]);

  if (!RiveComponent) {
    return (
      // ✅ تغییر سایز دسکتاپ: اضافه شدن md:w-[450px] md:h-[450px]
      <div className="w-54 h-54 md:w-[450px] md:h-[450px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ تغییر سایز دسکتاپ: اضافه شدن md:w-[450px] md:h-[450px]
  return <RiveComponent className="w-60 h-60 md:w-[400px] md:h-[400px] relative" />;
});

RiveAnimation.displayName = 'RiveAnimation';

// ✅ کامپوننت اصلی با remount logic
const RivePanelWrapper = memo(({ isSpeaking }: RivePanelWrapperProps) => {
  const [remountKey, setRemountKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Re-mount every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      setRemountKey(prev => prev + 1);
    }, 125000); // 3 minutes = 180000ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-t "></div>
      
      <div className="flex justify-center -mb-8 md:-mb-8">
        <div className="relative">
          <RiveAnimation
            key={remountKey}
            isSpeaking={isSpeaking}
            onReady={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
});

RivePanelWrapper.displayName = 'RivePanelWrapper';

export default RivePanelWrapper;
