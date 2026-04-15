// components/ui/RiveAvatar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRive, Layout, Fit, Alignment } from "rive-react";

export default function RiveAvatar() {
  const [remountKey, setRemountKey] = useState(0);

  // Refresh every 3 minutes (same behavior)
  useEffect(() => {
    const interval = setInterval(() => {
      setRemountKey((prev) => prev + 1);
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  const { RiveComponent } = useRive({
    src: process.env.NEXT_PUBLIC_rive || "character_noLogo.riv",
    autoplay: true,
    stateMachines: "StateMachine",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.BottomCenter,
    }),
  });

  return (
    <div
      key={remountKey}
      className="relative w-full h-full flex items-end justify-center"
    >
      <RiveComponent className="w-full h-full object-contain" />
    </div>
  );
}
