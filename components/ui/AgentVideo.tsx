// components/ui/AgentVideo.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VideoOff } from "lucide-react";

interface AgentVideoProps {
  videoElement: HTMLVideoElement | null;
  isVideoEnabled: boolean;
  isAgentConnected: boolean;
}

export default function AgentVideo({ 
  videoElement, 
  isVideoEnabled, 
  isAgentConnected 
}: AgentVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!containerRef.current || !videoElement) return;

  const container = containerRef.current;
  const vid = videoElement;

  if (isVideoEnabled) {
    if (!container.contains(vid)) {
      container.appendChild(vid);
    }
    const stream = vid.srcObject;
    if (stream) {
      vid.srcObject = null;
      requestAnimationFrame(() => {
        vid.srcObject = stream;
        vid.play().catch(() => {});
      });
    }
  }
}, [videoElement, isVideoEnabled]);

  if (!isAgentConnected) return null;

  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={`
          relative rounded-xl overflow-hidden
          bg-slate-800/50 backdrop-blur-sm border border-white/10
          /* ✅ تغییر سایز دسکتاپ: عرض بزرگتر در حالت md */
          w-full md:w-[600px] aspect-video
        `}
      >
        {isVideoEnabled ? (
          <div
            ref={containerRef}
            className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff className="text-white/40" size={32} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
