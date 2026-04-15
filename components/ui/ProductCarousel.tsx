// components/widget/ProductCarousel.tsx
"use client";

import {
  motion,
  AnimatePresence,
  PanInfo,
  Variants,
  LayoutGroup
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Maximize2,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Translation } from "@/utils/translations";

// --- TYPES ---

interface Product {
  name: string;
  image: string | string[];
  link: string;
  price?: number | string | null;
}

interface ProductCarouselProps {
  products: Product[];
  onClearProducts: () => void;
  t: Translation;
}

// --- CONFIGURATION ---
const GAP_SIZE = 12; // Adjusted for compact feel
const AUTO_SLIDE_INTERVAL = 6000; 

// Premium Spring Transition (High-end feel)
const springTransition = {
  type: "spring" as const,
  stiffness: 350, 
  damping: 35,
  mass: 1
};

// Gallery Slider Variants
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "105%" : "-105%",
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "105%" : "-105%",
    opacity: 0,
    scale: 0.98,
  }),
};

export default function ProductCarousel({
  products,
  onClearProducts,
  t,
}: ProductCarouselProps) {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Gallery State
  const [isGalleryView, setIsGalleryView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // --- HELPERS ---
  const getFirstImage = (image: string | string[]) => Array.isArray(image) ? image[0] : image;
  const getAllImages = (image: string | string[]) => Array.isArray(image) ? image : [image];
  const hasMultipleImages = (image: string | string[]) => Array.isArray(image) && image.length > 1;

  // --- SCROLL LOGIC ---
  const scrollToIndex = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const child = container.firstElementChild as HTMLElement;
    if (!child) return;
    
    const scrollPos = (child.offsetWidth + GAP_SIZE) * index;

    container.scrollTo({
      left: scrollPos,
      behavior: "smooth",
    });
    
    setCurrentProductIndex(index);
  }, []);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const child = container.firstElementChild as HTMLElement;
    if (!child) return;

    const itemWidth = child.offsetWidth + GAP_SIZE;
    const newIndex = Math.round(container.scrollLeft / itemWidth);

    if (newIndex !== currentProductIndex && newIndex >= 0 && newIndex < products.length) {
      setCurrentProductIndex(newIndex);
    }
  };

  const handleNext = useCallback(() => {
    const nextIndex = (currentProductIndex + 1) % products.length;
    scrollToIndex(nextIndex);
  }, [currentProductIndex, products.length, scrollToIndex]);

  const handlePrev = () => {
    const prevIndex = Math.max(currentProductIndex - 1, 0);
    scrollToIndex(prevIndex);
  };

  // --- AUTO SLIDE ---
  useEffect(() => {
    if (isGalleryView || isPaused || products.length <= 1) return;
    const intervalId = setInterval(handleNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isGalleryView, isPaused, products.length, handleNext]);

  // --- GALLERY LOGIC ---
  const openGallery = (product: Product) => {
    setIsPaused(true);
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setPage([0, 0]);
    setIsImageLoading(true);
    setIsGalleryView(true);
  };

  const closeGallery = () => {
    setIsGalleryView(false);
    setTimeout(() => {
      setSelectedProduct(null);
      setIsPaused(false);
    }, 300);
  };

  const paginateImage = (newDirection: number) => {
    if (!selectedProduct) return;
    const images = getAllImages(selectedProduct.image);
    let newIndex = currentImageIndex + newDirection;
    
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;

    setIsImageLoading(true);
    setPage([newIndex, newDirection]);
    setCurrentImageIndex(newIndex);
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000 || offset.x < -80) paginateImage(1);
    else if (swipe > 10000 || offset.x > 80) paginateImage(-1);
  };

  if (!products || products.length === 0) return null;

  return (
    <div
      dir="ltr"
      className="relative w-full select-none group/carousel flex flex-col gap-2 md:gap-3 font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {isGalleryView && selectedProduct ? (
            /* ==============================
               MODE 1: COMPACT GALLERY VIEW
               ============================== */
            <motion.div
              key="gallery-view"
              layoutId="gallery-container"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={springTransition}
              className="w-full h-[250px] md:h-[350px] relative flex flex-col rounded-[20px] md:rounded-[24px] overflow-hidden border border-white/10 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] bg-[#030303]"
            >
              {/* Blue Gradient Mesh */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-slate-900/10 z-0 pointer-events-none" />

              {/* Header */}
              <div className="relative z-20 h-10 md:h-12 w-full flex items-center justify-between px-3 md:px-5 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <button
                  onClick={closeGallery}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white transition-all py-2 active:scale-95"
                >
                  <ArrowLeft size={16} />
                  <span className="text-[11px] md:text-xs font-medium tracking-wide uppercase">{t.productCarousel?.return || "Return"}</span>
                </button>

                {/* Indicators */}
                <div className="flex gap-1.5 bg-black/30 p-1 rounded-full backdrop-blur-sm border border-white/5">
                  {getAllImages(selectedProduct.image).map((_, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      className={`h-1 rounded-full ${idx === currentImageIndex ? "bg-white" : "bg-white/20"}`}
                      animate={{ width: idx === currentImageIndex ? 16 : 4 }}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Nav Arrows (Keep Hidden on Mobile for clean view, swipe works) */}
              {getAllImages(selectedProduct.image).length > 1 && (
                <>
                  <button onClick={() => paginateImage(-1)} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/5 text-white/80 hover:text-white transition-all active:scale-90">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => paginateImage(1)} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/5 text-white/80 hover:text-white transition-all active:scale-90">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Image Stage */}
              <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center z-10 bg-black/10">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing p-4 md:p-8"
                  >
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="text-blue-400 w-6 h-6 animate-spin" />
                      </div>
                    )}
                    <img
                      src={getAllImages(selectedProduct.image)[currentImageIndex]}
                      alt="Gallery View"
                      draggable={false}
                      onLoad={() => setIsImageLoading(false)}
                      className={`max-w-full max-h-full object-contain drop-shadow-xl select-none pointer-events-none transition-all duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            /* ==============================
               MODE 2: COMPACT LIST VIEW
               ============================== */
            <motion.div
              key="carousel-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-2 md:gap-3"
            >
              {/* Scroll Container */}
              <div
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory px-1 py-1 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <motion.div
                      key={`${product.name}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)", transition: { duration: 0.2 } }}
                      transition={springTransition}
                      className="shrink-0 snap-center w-[85vw] md:w-[calc(50%-8px)]"
                    >
                      <div className="relative h-[110px] md:h-[144px] w-full bg-[#080808]/90 backdrop-blur-xl border border-white/5 rounded-[18px] md:rounded-[22px] overflow-hidden flex group hover:border-white/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300">
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearProducts();
                          }}
                          className="absolute top-2 right-2 z-40 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors"
                        >
                          <X size={12} />
                        </motion.button>

                        <div className="w-[100px] md:w-[150px] relative h-full shrink-0 bg-[#020202]">
                          <img
                            src={getFirstImage(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-100 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#080808]/90" />
                          
                          {hasMultipleImages(product.image) && (
                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                              <Layers size={9} className="text-white/90" />
                              <span className="text-[9px] font-bold text-white">{getAllImages(product.image).length}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between relative min-w-0">
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />

                          <div>
                            <div className="flex items-start justify-between pr-5">
                              <h3 className="text-[13px] md:text-[15px] font-medium text-white/90 leading-[1.3] line-clamp-2 group-hover:text-white transition-colors">
                                {product.name}
                              </h3>
                            </div>
                            {product.price && (
                              <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-[10px] md:text-xs text-white/30 font-light uppercase tracking-wider">EUR</span>
                                <span className="text-[13px] md:text-sm font-semibold text-emerald-400 tracking-wide">
                                   {String(product.price).replace(/[^\d.,-]/g, "")}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-auto">
                            <a
                              href={product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 relative h-8 md:h-9 flex items-center justify-center gap-1.5 rounded-lg md:rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-[11px] md:text-xs font-medium text-blue-100 hover:text-white transition-all overflow-hidden group/btn border border-blue-500/10 hover:border-blue-500/30 active:scale-[0.98]"
                            >
                              <span>{t.productCarousel?.viewDetails || "View details"}</span>
                              <ExternalLink size={11} className="text-blue-300/70 group-hover/btn:translate-x-0.5 transition-transform" />
                            </a>

                            {hasMultipleImages(product.image) && (
                              <button
                                onClick={() => openGallery(product)}
                                className="h-8 md:h-9 w-8 md:w-9 flex items-center justify-center rounded-lg md:rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5 transition-all active:scale-95"
                              >
                                <Maximize2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* --- FOOTER CONTROLS --- */}
              <div className="flex items-center justify-between px-1.5">
                 {/* Pagination Dots (Blue) */}
                <div className="flex items-center gap-1">
                  {products.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToIndex(idx)}
                      className="group relative py-2 px-0.5"
                    >
                        <div className={`h-1 rounded-full transition-all duration-500 ${
                          idx === currentProductIndex 
                            ? "w-5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                            : "w-1 bg-white/10 hover:bg-white/30"
                        }`} />
                    </button>
                  ))}
                </div>

                {/* --- UPDATED: Navigation Arrows (Visible on Mobile) --- */}
                {products.length > 2 && (
                  <div className="flex gap-1 md:gap-1.5"> 
                     <button
                        onClick={handlePrev}
                        disabled={currentProductIndex === 0}
                        // Mobile: w-6 h-6, Desktop: md:w-7 md:h-7
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full border border-white/5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                     >
                       {/* Icon scales with screen: 12px mobile, 14px desktop */}
                       <ChevronLeft className="w-3 h-3 md:w-3.5 md:h-3.5" />
                     </button>
                     <button
                        onClick={handleNext}
                        // Mobile: w-6 h-6, Desktop: md:w-7 md:h-7
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full border border-white/5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                     >
                       <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                     </button>
                  </div>
                )}
              
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
