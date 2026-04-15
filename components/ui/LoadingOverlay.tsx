// components/widget/ui/LoadingOverlay.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  loadingStep: number;
  loadingMessages: string[];
  onRetry?: () => void;
  t: any;
}

export default function LoadingOverlay({
  loadingStep,
  loadingMessages,
  onRetry,
  t,
}: LoadingOverlayProps) {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loadingStep === loadingMessages.length - 1) {
      timeout = setTimeout(() => {
        setShowRetry(true);
      }, 5000);
    } else {
      setShowRetry(false);
    }
    return () => clearTimeout(timeout);
  }, [loadingStep, loadingMessages.length]);

  return (
    <motion.div
      key="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      // z-index بالا و pointer-events برای جلوگیری از کلیک زیرین هنگام لودینگ
      className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-[#0a0f1a] backdrop-blur-md pointer-events-auto"
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-[280px]">
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          {showRetry ? (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowRetry(false);
                if (onRetry) onRetry();
                else window.location.reload();
              }}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
            >
              <RefreshCcw size={28} className="text-slate-200 group-hover:text-white" />
            </motion.button>
          ) : (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[1px] border-transparent border-t-blue-500/50 border-r-blue-400/30 blur-[1px]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-2 rounded-full border-[2px] border-white/5 border-t-white/80"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
              />
            </>
          )}
        </div>

        <div className="h-12 w-full flex items-center justify-center overflow-hidden relative">
          <AnimatePresence mode="wait">
            {showRetry ? (
              <motion.p
                key="retry-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/80 text-sm font-light tracking-widest uppercase text-center"
              >
                {t.loading.errorConnecting}
                <span className="block text-[10px] text-white/40 normal-case mt-1 font-sans tracking-normal">
                  {t.loading.tapToRetry}
                </span>
              </motion.p>
            ) : (
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(5px)" }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="absolute text-white text-base font-light tracking-wide text-center w-full"
              >
                {loadingMessages[loadingStep]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {!showRetry && (
          <div className="flex gap-1.5 mt-6">
            {loadingMessages.map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  height: 3,
                  width: loadingStep === index ? 24 : 6,
                  backgroundColor: loadingStep >= index ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.1)",
                  opacity: loadingStep >= index ? 1 : 0.3
                }}
                transition={{ duration: 0.3 }}
                className="rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
