// components/widget/SocialPostGallery.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, PanInfo, LayoutGroup, Variants } from "framer-motion";
import { 
  Download, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  X 
} from "lucide-react";
import { GeneratedImage } from "../../hooks/useLiveKitVoiceChat";

// ─── TYPES ───
interface SocialPostGalleryProps {
  images: GeneratedImage[];
  onClose?: () => void;
  t: any;
}

// ─── ANIMATION VARIANTS ───
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
};

export default function SocialPostGallery({ images, onClose, t }: SocialPostGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isCopied, setIsCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // اگر تصویری وجود ندارد، چیزی رندر نکن
  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  // ─── PRELOADING (SAFE METHOD) ───
  // استفاده از Image() استاندارد که CSP معمولا با آن مشکلی ندارد (img-src)
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (index >= 0 && index < images.length) {
        const img = new Image();
        img.src = images[index].image_url;
      }
    };
    preloadImage(currentIndex + 1 >= images.length ? 0 : currentIndex + 1);
    preloadImage(currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images]);

  // ریست وضعیت لودینگ هنگام تغییر صفحه
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  // ─── HANDLERS ───
  const paginate = useCallback((newDirection: number) => {
    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;
    
    setPage([nextIndex, newDirection]);
    setCurrentIndex(nextIndex);
    setIsCopied(false);
  }, [currentIndex, images.length]);

  const handleCopyDescription = async () => {
    if (currentImage.description) {
      try {
        await navigator.clipboard.writeText(currentImage.description);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  // ─── SAFE DOWNLOAD HANDLER ───
  // به جای fetch، یک لینک مخفی می‌سازیم و کلیک می‌کنیم.
  // این روش CSP را دور می‌زند چون درخواست از نوع connect نیست.
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.image_url;
    link.target = '_blank'; // در تب جدید باز شود تا دانلود شروع شود
    link.download = `ai-image-${Date.now()}.jpg`; // تلاش برای پیشنهاد نام فایل
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -8000 || offset.x < -60) paginate(1);
    else if (swipe > 8000 || offset.x > 60) paginate(-1);
  };

  return (
    <div className="w-full select-none font-sans  ">
      <LayoutGroup>
        <motion.div 
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-[400px] mx-auto"
        >
          {/* Card Container */}
          <div className="relative h-[210px] w-full bg-[#121212] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl group isolate">
            
            {/* 1. Background Blur (Atmosphere) */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
               {/* استفاده از div و background-image برای پرفورمنس بهتر در بلر */}
               <div 
                 className="absolute inset-0 bg-cover bg-center blur-xl scale-125 transition-all duration-700"
                 style={{ backgroundImage: `url(${currentImage.image_url})` }}
               />
               <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* 2. Main Image Area */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  drag={hasMultiple ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2} 
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  {/* Skeleton Loader */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <Sparkles className="text-white/20 w-8 h-8 animate-pulse" />
                    </div>
                  )}

                  {/* Standard IMG Tag - No Fetch API involved */}
                  <img
                    src={currentImage.image_url}
                    alt="AI Generated"
                    className={`max-w-full max-h-full object-contain shadow-lg transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    draggable={false}
                    // ویژگی مهم: عدم استفاده از crossOrigin مگر اینکه لازم باشد، چون ممکن است باعث خطای CORS شود
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 3. Overlay Gradients */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                 <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            </div>

            {/* 4. Top Header */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3">
              

               {onClose && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                >
                  <X size={14} />
                </button>
               )}
            </div>

            {/* 5. Navigation Arrows */}
            {hasMultiple && (
              <>
                <button 
                  onClick={() => paginate(-1)} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-black/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => paginate(1)} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-black/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* 6. Bottom Controls */}
            <div className="absolute bottom-3 left-3 right-3 z-30 flex items-end justify-between gap-2">
                
                {/* Info & Dots */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {hasMultiple && (
                        <div className="flex gap-1">
                            {images.map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-3 bg-white" : "w-1 bg-white/30"}`} />
                            ))}
                        </div>
                    )}
                    {currentImage.description && (
                        <p className="text-[11px] leading-tight text-white/80 line-clamp-2 font-medium drop-shadow-md">
                            {currentImage.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mb-0.5">
                    <motion.button
                        onClick={handleCopyDescription}
                        whileTap={{ scale: 0.95 }}
                        className="h-8 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold backdrop-blur-md border transition-all bg-white/10 border-white/10 text-white hover:bg-white/20"
                    >
                        {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{isCopied ? (t.socialPostGallery?.copied || "Copied") : (t.socialPostGallery?.copy || "Copy")}</span>
                    </motion.button>

                    <motion.button
                        onClick={handleDownload}
                        whileTap={{ scale: 0.95 }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all bg-white/10 border-white/10 text-white hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-300"
                        title="Open Image"
                    >
                        <Download size={14} />
                    </motion.button>
                </div>
            </div>

          </div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
