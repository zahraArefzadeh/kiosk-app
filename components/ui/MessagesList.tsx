// components/widget/MessagesList.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import ProductCarousel from "./ProductCarousel";
import SocialPostGallery from "./SocialPostGallery"; 
import { useEffect, useState, useMemo } from "react";
import { GeneratedImage } from "../../hooks/useLiveKitVoiceChat";

interface Message {
  sender: "user" | "agent";
  text: string;
  timestamp: number;
}

interface MessagesListProps {
  messages: Message[];
  isAgentTyping: boolean;
  products: any[];
  generatedImages?: GeneratedImage[]; 
  onClearProducts: () => void;
  onClearGeneratedImages: () => void; // ✅ اضافه شد
  t: any;
}

// 1. Optimized Text Animation: "Crisp & Snappy" (2026 Apple Spring ease)
const aiTextVariants: Variants = {
  hidden: { 
    opacity: 0, 
    filter: "blur(8px)", 
    y: 12,
    willChange: "opacity, transform, filter"
  },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
  exit: { 
    opacity: 0,
    y: -8, 
    filter: "blur(4px)",
    transition: {
      duration: 0.25, 
      ease: "easeIn"
    }
  }
};

// 2. Product Container: Smooth Layout Shift
const productContainerVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
  visible: { 
    opacity: 1, 
    height: "auto", 
    marginTop: 16, 
    marginBottom: 16,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    marginTop: 0, 
    marginBottom: 0,
    transition: { duration: 0.35, ease: "easeInOut" }
  }
};

export default function MessagesList({ 
  messages, 
  isAgentTyping,
  products,
  generatedImages = [], 
  onClearProducts,
  onClearGeneratedImages, // ✅ دریافت از props
  t
}: MessagesListProps) {
  
  const { lastUserMessage, lastAgentMessage } = useMemo(() => {
    const reversed = [...messages].reverse();
    return {
      lastUserMessage: reversed.find(m => m.sender === "user"),
      lastAgentMessage: reversed.find(m => m.sender === "agent")
    };
  }, [messages]);

  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (isAgentTyping) setShowTyping(true);
    else {
      const timer = setTimeout(() => setShowTyping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAgentTyping]);

  const hasContent = lastUserMessage || lastAgentMessage || isAgentTyping || products.length > 0 || generatedImages.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="w-full flex justify-center mb-8 md:mb-12 px-0 md:px-4">
      <motion.div
        layout="position"
        className="w-full max-w-2xl lg:max-w-4xl flex flex-col items-start"
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} 
      >
        
        {/* --- USER MESSAGE --- */}
        <AnimatePresence mode="popLayout">
          {lastUserMessage && (
            <motion.div 
              key={lastUserMessage.timestamp}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full px-2 md:px-0 mb-3 md:mb-8"
            >
              <p className="text-[17px] md:text-[24px] leading-[1.4] font-semibold text-[#1D1D1F] tracking-tight text-start antialiased selection:bg-[#0066CC]/20">
                {lastUserMessage.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PRODUCT CAROUSEL --- */}
        <AnimatePresence>
          {products.length > 0 && (
            <motion.div
              key="products-wrapper"
              variants={productContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full relative z-10 overflow-hidden" 
            >
              <ProductCarousel
                products={products}
                onClearProducts={onClearProducts}
                t={t}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ✅ GENERATED IMAGES (SOCIAL POSTS) --- */}
        <AnimatePresence>
          {generatedImages && generatedImages.length > 0 && (
            <motion.div
              key="social-posts-wrapper"
              variants={productContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full relative z-10" 
            >
              <SocialPostGallery
                images={generatedImages}
                onClose={onClearGeneratedImages} // ✅ اتصال دکمه بستن
                t={t}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- AGENT MESSAGE AREA --- */}
        <div className="w-full px-2 md:px-0 relative min-h-[2.5rem]">
            <AnimatePresence mode="popLayout" initial={false}>
                {lastAgentMessage ? (
                    <motion.div
                      key={lastAgentMessage.timestamp}
                      variants={aiTextVariants}
                      initial="hidden"
                      animate="visible"
                      className="w-full max-w-full md:max-w-[95%]"
                    >
                      <p className="text-[16px] md:text-[18px] leading-[1.7] md:leading-[1.8] text-[#424245] font-medium whitespace-pre-wrap antialiased tracking-normal selection:bg-[#0066CC]/20">
                        {lastAgentMessage.text}
                      </p>
                    </motion.div>
                ) : showTyping ? (
                  /* --- TYPING INDICATOR --- */
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                    className="flex items-center gap-3 pt-2"
                  >
                     <span className="text-[11px] uppercase tracking-[0.2em] text-[#86868B] font-bold select-none antialiased">
                       {t?.status?.typing || "THINKING"}
                     </span>
                     <motion.div 
                        className="h-[2.5px] bg-gradient-to-r from-[#0066CC] to-[#5AC8FA] rounded-full"
                        initial={{ width: 12, opacity: 0.4 }}
                        animate={{ 
                          width: [12, 32, 12], 
                          opacity: [0.4, 1, 0.4] 
                        }}
                        transition={{ 
                          duration: 1.4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                     />
                  </motion.div>
                ) : null}
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
