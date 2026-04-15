"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Tag } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  category: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "prod-1",  name: "Quantum Core X1",     description: "Next-gen quantum processing core redefining spatial computing with unparalleled neural capabilities.", image: "/1.jpeg", price: "$1,299", category: "Computing" },
  { id: "prod-2",  name: "Neural Link Pro",      description: "Direct brain-to-machine interface for seamless environmental control via non-invasive biometric sensors.", image: "/2.jpeg", price: "$899",   category: "Wearables" },
  { id: "prod-3",  name: "HoloLens Vision",      description: "Biocompatible AR contact lenses overlaying a high-definition layer onto your natural sight.", image: "/3.jpeg", price: "$2,499", category: "Wearables" },
  { id: "prod-4",  name: "Aero Drone 360",       description: "Fully autonomous reconnaissance drone with advanced 3D mapping and next-gen LiDAR sensor array.", image: "/4.jpeg", price: "$1,850", category: "Drones" },
  { id: "prod-5",  name: "Aether Smart Fabric",  description: "Intelligent textile with temperature-regulating nanobots that monitor your vital signs around the clock.", image: "/1.jpeg", price: "$450",   category: "Wearables" },
  { id: "prod-6",  name: "Omni Sound Array",     description: "Focused ambient audio system delivering pristine directional sound without disturbing those around you.", image: "/2.jpeg", price: "$600",   category: "Audio" },
  { id: "prod-7",  name: "Quantum Core X2",      description: "Enhanced quantum processor with dedicated neural acceleration and 40% improved thermal efficiency.", image: "/3.jpeg", price: "$1,599", category: "Computing" },
  { id: "prod-8",  name: "Sky Mapper Pro",       description: "Professional-grade autonomous drone with LiDAR, thermal imaging, and 8K cinematic capture.", image: "/4.jpeg", price: "$2,200", category: "Drones" },
  { id: "prod-9",  name: "Neural Band Elite",    description: "Advanced biometric wristband with real-time health monitoring and predictive wellness analytics.", image: "/1.jpeg", price: "$750",   category: "Wearables" },
  { id: "prod-10", name: "Echo Sphere",          description: "360-degree spatial audio system with adaptive sound field technology and room-calibration AI.", image: "/2.jpeg", price: "$850",   category: "Audio" },
  { id: "prod-11", name: "Quantum Mesh Network", description: "Distributed quantum computing nodes enabling ultra-low-latency edge processing at scale.", image: "/3.jpeg", price: "$3,499", category: "Computing" },
  { id: "prod-12", name: "Pulse Audio Mini",     description: "Compact wireless earbuds with active noise cancellation and 36-hour battery life.", image: "/4.jpeg", price: "$299",   category: "Audio" },
  { id: "prod-13", name: "Nano Weave Jacket",    description: "Self-heating smart jacket with embedded solar micro-cells and adaptive insulation layers.", image: "/1.jpeg", price: "$520",   category: "Wearables" },
  { id: "prod-14", name: "Stealth Drone X",      description: "Ultra-quiet stealth drone with whisper-mode propulsion and encrypted live-feed transmission.", image: "/2.jpeg", price: "$2,750", category: "Drones" },
  { id: "prod-15", name: "CoreSync Hub",         description: "Central quantum hub synchronizing all your devices with zero-latency mesh connectivity.", image: "/3.jpeg", price: "$980",   category: "Computing" },
];

const CATEGORIES = ["All", "Computing", "Wearables", "Drones", "Audio"];

// ── time-based: 40px در ثانیه — مستقل از frame rate ──
const PX_PER_SECOND = 40;

interface EcosystemCatalogProps {
  onAskAssistant?: (productName: string) => void;
}

export default function EcosystemCatalog({ onAskAssistant }: EcosystemCatalogProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const scrollRef        = useRef<HTMLDivElement>(null);
  const rafRef           = useRef<number>(0);
  const lastTimeRef      = useRef<number>(0);
  const isPausedRef      = useRef(false);
  const dragRef          = useRef({ active: false, startX: 0, scrollLeft: 0, lastX: 0, lastT: 0, vel: 0 });

  const filtered = selectedCategory === "All"
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  const infinite = [...filtered, ...filtered, ...filtered];

  // ── Time-based infinite scroll ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // شروع از وسط
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth / 3;
    });

    lastTimeRef.current = 0;

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min(now - lastTimeRef.current, 50); // cap at 50ms برای tab-switch
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

  // Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedProduct(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Touch
  const onTouchStart = useCallback(() => { isPausedRef.current = true; }, []);
  const onTouchEnd   = useCallback(() => { setTimeout(() => { isPausedRef.current = false; }, 1800); }, []);

  // Mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isPausedRef.current = true;
    const d = dragRef.current;
    d.active = true; d.startX = e.clientX; d.scrollLeft = el.scrollLeft;
    d.lastX = e.clientX; d.lastT = Date.now(); d.vel = 0;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current;
    if (!d.active || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = d.scrollLeft - (e.clientX - d.startX);
    const now = Date.now();
    d.vel = (e.clientX - d.lastX) / Math.max(now - d.lastT, 1);
    d.lastX = e.clientX; d.lastT = now;
  }, []);

  const onMouseUp = useCallback(() => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    let vel = d.vel * 10;
    const momentum = () => {
      if (!scrollRef.current || Math.abs(vel) < 0.3) { isPausedRef.current = false; return; }
      scrollRef.current.scrollLeft -= vel;
      vel *= 0.9;
      requestAnimationFrame(momentum);
    };
    requestAnimationFrame(momentum);
  }, []);

  const onMouseLeave = useCallback(() => { if (dragRef.current.active) onMouseUp(); }, [onMouseUp]);

  const handleCardClick = useCallback((product: Product) => {
    if (Math.abs(dragRef.current.vel) < 0.8) setSelectedProduct(product);
    dragRef.current.vel = 0;
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-sb::-webkit-scrollbar { display: none; }
        .no-sb { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="w-full h-full flex flex-col overflow-hidden  ">

        {/* ══ Category Bar — کیوسک‌سایز ══ */}
        <div className="shrink-0 px-6 pt-5 pb-4">
          <div className="no-sb flex items-center gap-3 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="relative shrink-0 px-6 py-2.5 rounded-full font-bold outline-none"
                  style={{
                    fontSize: "15px",
                    color: active ? "#fff" : "#6b7280",
                    minHeight: "44px", // Apple HIG minimum touch target
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="cat-pill"
                      className="absolute inset-0 rounded-full bg-slate-400"
                      style={{ zIndex: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ Product Strip ══ */}
        <div
          ref={scrollRef}
          className="no-sb flex gap-4 overflow-x-scroll overflow-y-hidden flex-1 items-stretch px-6 pb-5 cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "pan-x" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {infinite.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              onClick={() => handleCardClick(product)}
              className="flex flex-col bg-white rounded-3xl overflow-hidden shrink-0 h-full"
              style={{
                width: "calc(25% - 12px)",
                minWidth: "220px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              }}
            >
              {/* Image */}
              <div
                className="w-full shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
                style={{ height: "50%" }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  draggable={false}
                  className="w-4/5 h-4/5 object-contain pointer-events-none"
                  style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))" }}
                />
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 px-5 py-4 gap-2 min-h-0">
                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 font-bold text-blue-500 uppercase tracking-wider w-fit"
                  style={{ fontSize: "11px" }}>
                  <Tag size={10} />
                  {product.category}
                </span>

                {/* Name — بزرگ و خوانا */}
                <h3 className="text-[#1D1D1F] font-bold leading-snug line-clamp-1"
                  style={{ fontSize: "17px" }}>
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-[#6e6e73] leading-relaxed line-clamp-2 flex-1 min-h-0"
                  style={{ fontSize: "13px" }}>
                  {product.description}
                </p>

                {/* Price row */}
                <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
                  <span className="font-bold text-[#1D1D1F]" style={{ fontSize: "18px" }}>
                    {product.price}
                  </span>
                  <span className="font-semibold text-[#86868B]" style={{ fontSize: "13px" }}>
                    Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Modal ══ */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-100/20 backdrop-blur-lg"
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex z-10"
              style={{ width: "60%", height: "80%", minWidth: "380px" }}
            >
              {/* Close — بزرگ برای لمس */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-5 right-5 z-50 flex items-center justify-center bg-black/8 rounded-full"
                style={{ width: "44px", height: "44px" }}
              >
                <X size={18} strokeWidth={2.5} className="text-[#1D1D1F]" />
              </button>

              {/* Image side */}
              <div className="w-[45%] shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-10">
                <motion.img
                  key={selectedProduct.id}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain"
                  style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))" }}
                />
              </div>

              {/* Info side */}
              <div className="flex-1 flex flex-col justify-between p-9 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  <span className="inline-flex items-center gap-2 font-bold text-blue-500 tracking-widest uppercase"
                    style={{ fontSize: "12px" }}>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {selectedProduct.category}
                  </span>
                  <h2 className="font-bold text-[#1D1D1F] tracking-tight leading-tight"
                    style={{ fontSize: "28px" }}>
                    {selectedProduct.name}
                  </h2>
                  <p className="text-[#515154] leading-relaxed"
                    style={{ fontSize: "16px" }}>
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wider mb-1"
                      style={{ fontSize: "11px" }}>Price</p>
                    <span className="font-bold text-[#1D1D1F]" style={{ fontSize: "36px" }}>
                      {selectedProduct.price}
                    </span>
                  </div>
                  {/* بزرگ برای لمس راحت */}
                  <button
                    onClick={() => {
                      const name = selectedProduct.name;
                      setSelectedProduct(null);
                      if (onAskAssistant) setTimeout(() => onAskAssistant(name), 250);
                    }}
                    className="flex items-center gap-2.5 bg-[#1D1D1F] text-white rounded-full font-bold active:scale-95 transition-transform"
                    style={{ fontSize: "16px", padding: "14px 28px", minHeight: "52px" }}
                  >
                    <MessageSquare size={18} />
                    Ask Assistant
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
