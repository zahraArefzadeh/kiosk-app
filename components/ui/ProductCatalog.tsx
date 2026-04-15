"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Info, Cpu, Zap, Maximize2 } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  price: string;
  category: string;
}

const defaultGallery = ["/1.jpeg", "/2.jpeg", "/3.jpeg", "/4.jpeg"];

const MOCK_PRODUCTS: Product[] = [
  { id: "prod-1",  name: "Quantum Core X1",     description: "Next-gen quantum processing core redefining spatial computing with unparalleled neural capabilities.", image: "/1.jpeg", gallery: defaultGallery, price: "$1,299", category: "Computing" },
  { id: "prod-2",  name: "Neural Link Pro",      description: "Direct brain-to-machine interface for seamless environmental control via non-invasive biometric sensors.", image: "/2.jpeg", gallery: defaultGallery, price: "$899",   category: "Wearables" },
  { id: "prod-3",  name: "HoloLens Vision",      description: "Biocompatible AR contact lenses overlaying a high-definition layer onto your natural sight.", image: "/3.jpeg", gallery: defaultGallery, price: "$2,499", category: "Wearables" },
  { id: "prod-4",  name: "Aero Drone 360",       description: "Fully autonomous reconnaissance drone with advanced 3D mapping and next-gen LiDAR sensor array.", image: "/4.jpeg", gallery: defaultGallery, price: "$1,850", category: "Drones" },
  { id: "prod-5",  name: "Aether Smart Fabric",  description: "Intelligent textile with temperature-regulating nanobots that monitor your vital signs around the clock.", image: "/1.jpeg", gallery: defaultGallery, price: "$450",   category: "Wearables" },
];

const CATEGORIES = ["All", "Computing", "Wearables", "Drones"];
const PX_PER_SECOND = 40;

interface EcosystemCatalogProps {
  onAskAssistant?: (productName: string) => void;
}

export default function EcosystemCatalog({ onAskAssistant }: EcosystemCatalogProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const scrollRef        = useRef<HTMLDivElement>(null);
  const rafRef           = useRef<number>(0);
  const lastTimeRef      = useRef<number>(0);
  const isPausedRef      = useRef(false);
  const dragRef          = useRef({ active: false, startX: 0, scrollLeft: 0, lastX: 0, lastT: 0, vel: 0 });

  const filtered = selectedCategory === "All"
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  const infinite = [...filtered, ...filtered, ...filtered];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollLeft = el.scrollWidth / 3; });
    lastTimeRef.current = 0;

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;

      if (!isPausedRef.current && !selectedProduct) {
        el.scrollLeft += (PX_PER_SECOND * dt) / 1000;
        if (el.scrollLeft >= (el.scrollWidth * 2) / 3) {
          el.scrollLeft -= el.scrollWidth / 3;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [selectedCategory, selectedProduct]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProduct(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const handleCardClick = useCallback((product: Product) => {
    if (Math.abs(dragRef.current.vel) < 0.8) {
      setSelectedProduct(product);
      setActiveImageIdx(0);
    }
    dragRef.current.vel = 0;
  }, []);

  // انیمیشن‌های ورود گره‌ها به صورت متوالی (Staggered)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-sb::-webkit-scrollbar { display: none; }
        .no-sb { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="w-full h-full flex flex-col overflow-hidden   ">
        {/* Category Bar */}
        <div className="shrink-0 px-6 pt-5 pb-4">
          <div className="no-sb flex items-center gap-3 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="relative shrink-0 px-6 py-2.5 rounded-full font-bold outline-none transition-colors"
                  style={{ fontSize: "15px", color: active ? "#fff" : "#64748b", minHeight: "44px" }}
                >
                  {active && (
                    <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-slate-800" style={{ zIndex: 0 }} transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Strip */}
        <div ref={scrollRef} className="no-sb flex gap-4 overflow-x-scroll overflow-y-hidden flex-1 items-stretch px-6 pb-5 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={(e) => {
            isPausedRef.current = true;
            dragRef.current = { active: true, startX: e.clientX, scrollLeft: scrollRef.current!.scrollLeft, lastX: e.clientX, lastT: Date.now(), vel: 0 };
          }}
          onMouseMove={(e) => {
            const d = dragRef.current;
            if (!d.active || !scrollRef.current) return;
            scrollRef.current.scrollLeft = d.scrollLeft - (e.clientX - d.startX);
            d.vel = (e.clientX - d.lastX) / Math.max(Date.now() - d.lastT, 1);
            d.lastX = e.clientX; d.lastT = Date.now();
          }}
          onMouseUp={() => { dragRef.current.active = false; isPausedRef.current = false; }}
          onMouseLeave={() => { dragRef.current.active = false; isPausedRef.current = false; }}
        >
          {infinite.map((product, i) => (
            <div key={`${product.id}-${i}`} onClick={() => handleCardClick(product)} className="flex flex-col bg-white rounded-[24px] overflow-hidden shrink-0 h-full border border-slate-100 shadow-sm hover:shadow-md transition-shadow" style={{ width: "calc(25% - 12px)", minWidth: "220px" }}>
              <div className="w-full shrink-0 bg-slate-50 flex items-center justify-center p-6" style={{ height: "50%" }}>
                <img src={product.image} alt={product.name} draggable={false} className="w-full h-full object-contain pointer-events-none mix-blend-multiply drop-shadow-sm" />
              </div>
              <div className="flex flex-col flex-1 px-5 py-4 gap-2 min-h-0 bg-white">
                <span className="inline-flex items-center gap-1.5 font-bold text-indigo-500 uppercase tracking-wider w-fit" style={{ fontSize: "11px" }}><Tag size={10} />{product.category}</span>
                <h3 className="text-slate-900 font-semibold tracking-tight leading-snug line-clamp-1" style={{ fontSize: "17px" }}>{product.name}</h3>
                <p className="text-slate-500 font-light leading-relaxed line-clamp-2 flex-1 min-h-0" style={{ fontSize: "13px" }}>{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Structured Modern UI Modal ══ */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center font-sans p-4 md:p-8">
            {/* Backdrop: Clean, technical dot grid with deep blur */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-100/80  "
              style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />

            {/* Main Modal Container */}
            <motion.div
              key="modal-container"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="relative w-full max-w-6xl h-full max-h-[800px] flex flex-col md:flex-row gap-6 z-10"
            >
              {/* Close Button - Global */}
              <button onClick={() => setSelectedProduct(null)} className="absolute -top-4 -right-4 md:top-0 md:-right-16 z-[60] bg-white/80 backdrop-blur-md text-slate-600 p-3 rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-lg border border-slate-200">
                <X size={24} strokeWidth={2.5} />
              </button>

              {/* 📷 Left Column: Visual Core */}
              <motion.div variants={itemVariants} className="w-full md:w-1/2 h-full flex flex-col gap-4">
                {/* Main Image Node */}
                <div className="relative flex-1 bg-white/90 backdrop-blur-md rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full scale-75" />
                  <motion.div 
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-full h-full flex items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={activeImageIdx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        src={selectedProduct.gallery[activeImageIdx]} 
                        alt="Main Product" 
                        className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] mix-blend-multiply" 
                      />
                    </AnimatePresence>
                  </motion.div>
               
                </div>

                {/* Gallery Node */}
                <div className="h-32 bg-white/90 backdrop-blur-md rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-center justify-center gap-4">
                  {selectedProduct.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative h-full aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        idx === activeImageIdx 
                          ? "border-indigo-500 shadow-md scale-105" 
                          : "border-transparent bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply" alt={`Thumb ${idx}`} />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* 📊 Right Column: Data Nodes */}
              <div className="w-full md:w-1/2 h-full flex flex-col gap-4">
                
                {/* 🏷️ Title Node */}
                <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-md p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                
                  <h2 className="text-4xl font-semibold tracking-tight text-slate-900 leading-none">
                    {selectedProduct.name}
                  </h2>
                </motion.div>

                {/* 📝 Specs Node */}
                <motion.div variants={itemVariants} className="flex-1 bg-white/90 backdrop-blur-md p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-4 border-b border-slate-100 pb-4">
                    <Info size={18} />
                    <span className="uppercase tracking-widest text-xs font-bold">Technical Specs</span>
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed font-light">
                    {selectedProduct.description}
                  </p>
                </motion.div>

                {/* Bottom Row: Value & Action */}
                <div className="flex gap-4">
                  {/* 💵 Value Node */}
                  <motion.div variants={itemVariants} className="flex-1 bg-slate-900/95 backdrop-blur-md text-white p-6 rounded-[24px] shadow-xl border border-slate-800 flex flex-col justify-center">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-semibold">Price</p>
                    <p className="text-4xl font-light tracking-tight">{selectedProduct.price}</p>
                  </motion.div>

                  {/* 🤖 Action Node */}
                  <motion.div variants={itemVariants} className="flex-1">
                    <button
                      onClick={() => {
                        const name = selectedProduct.name;
                        setSelectedProduct(null);
                        if (onAskAssistant) setTimeout(() => onAskAssistant(name), 250);
                      }}
                      className="w-full h-full group flex flex-col items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-[24px] shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.4)] transition-all"
                    >
                      <Zap size={28} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium tracking-wide">Ask AI Assistant</span>
                    </button>
                  </motion.div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
