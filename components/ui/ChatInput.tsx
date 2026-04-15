// components/widget/ChatInput.tsx
"use client";

import { Translation } from "@/utils/translations";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Mic } from "lucide-react"; // Send Removed visually
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// 🎯 UNIFIED MOTION SYSTEM — matches WidgetView.tsx
// ═══════════════════════════════════════════════════════════════
const MOTION = {
  ease: [0.32, 0.72, 0, 1],
  duration: {
    instant: 0.12,
    fast: 0.2,
    normal: 0.28,
  },
} as const;

const spring = {
  layout: { type: "spring", damping: 28, stiffness: 300, mass: 0.8 } as Transition,
};

const fade = {
  duration: MOTION.duration.instant,
  ease: MOTION.ease,
};

// ═══════════════════════════════════════════════════════════════

interface ChatInputProps {
  inputValue: string;
  isMicMuted: boolean;
  isConnected: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onMicPress: () => void;
  onMicRelease: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  t: Translation;
}

export default function ChatInput({
  inputValue,     // Kept for logic compatibility
  isMicMuted,
  isConnected,
  onInputChange,  // Kept for logic compatibility
  onSend,         // Kept for logic compatibility
  onMicPress,
  onMicRelease,
  inputRef,       // Kept to avoid breaking parent refs
  t,
}: ChatInputProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const isHoldingRef = useRef(false);

  // ✅ ENV CONTROL: Defaults to true unless explicitly set to 'false'
  const showMicrophone = process.env.NEXT_PUBLIC_ENABLE_MIC !== "false";

  // ── Mic permission ──
  useEffect(() => {
    if (showMicrophone) {
      checkMicPermission();
    }
  }, [showMicrophone]);

  const checkMicPermission = async () => {
    try {
      if ("permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          setHasMicPermission(result.state === "granted");
          result.addEventListener("change", () =>
            setHasMicPermission(result.state === "granted")
          );
          return;
        } catch {}
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      setHasMicPermission(
        devices.some((d) => d.kind === "audioinput" && d.label !== "")
      );
    } catch {
      setHasMicPermission(false);
    }
  };

  const requestMicPermission = async () => {
    if (isRequestingPermission) return;
    setIsRequestingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasMicPermission(true);
    } catch {
      setHasMicPermission(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // ── Recording logic ──
  const stopRecording = useCallback(() => {
    if (!isHoldingRef.current) return;
    setIsHolding(false);
    isHoldingRef.current = false;
    onMicRelease();
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.touchAction = "";
    window.removeEventListener("pointerup", stopRecording);
    window.removeEventListener("pointercancel", stopRecording);
    window.removeEventListener("touchend", stopRecording);
  }, [onMicRelease]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showMicrophone) return; // Guard clause

    if (!hasMicPermission) {
      requestMicPermission();
      return;
    }
    // Only block if not connected
    if (!isConnected) return;

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}

    isHoldingRef.current = true;
    setIsHolding(true);
    onMicPress();

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.touchAction = "none";

    window.addEventListener("pointerup", stopRecording);
    window.addEventListener("pointercancel", stopRecording);
    window.addEventListener("touchend", stopRecording);
    window.addEventListener("contextmenu", (ev) => ev.preventDefault(), {
      once: true,
    });
  };

  const isRecordingUI = isHolding && showMicrophone;

  // ═══════════════════════════════════════════════════════════════
  // 🎨 RENDER (Voice-Only Redesign)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      className="w-full      select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Hidden input to satisfy parent ref logic if needed */}
      <input type="hidden" ref={inputRef as React.RefObject<HTMLInputElement>} />

      <motion.button
        layout
        initial={false}
        transition={spring.layout}
        onPointerDown={handlePointerDown}
        onPointerUp={stopRecording}
        onPointerCancel={stopRecording}
        disabled={!isConnected || isRequestingPermission}
        className={`
          relative w-full flex flex-col items-center justify-center overflow-hidden
          rounded-3xl h-14 md:h-14 shadow-lg
          transition-all active:scale-[0.98]
          ${
            isRecordingUI
              ? "bg-emerald-500/90 border border-emerald-400/50 shadow-emerald-500/20"
              : "bg-slate-800 border border-white/[0.08] hover:bg-slate-700/80"
          }
          ${(!isConnected || isRequestingPermission) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        style={{
          transitionProperty: "background-color, border-color, box-shadow",
          transitionDuration: `${MOTION.duration.fast * 1000}ms`,
          transitionTimingFunction: `cubic-bezier(${MOTION.ease.join(",")})`,
          touchAction: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          outline: "none",
        }}
      >
        <AnimatePresence mode="wait">
          {isRecordingUI ? (
            // ── Active Recording State ──
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={fade}
              className="flex items-center justify-center gap-4 pointer-events-none select-none z-10 w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              >
                <Mic className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" strokeWidth={2} />
              </motion.div>

              <div className="flex items-center gap-1 h-5 md:h-6">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    className="w-1 md:w-1.5 h-full bg-white/90 rounded-full origin-center"
                  />
                ))}
              </div>

              <span className="text-sm md:text-base font-medium text-white tracking-wide select-none drop-shadow-sm">
                {t.input.listening}
              </span>
            </motion.div>

          ) : showMicrophone ? (
            // ── Idle State (Hold to Speak) ──
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={fade}
              className="flex items-center justify-center gap-3 w-full"
            >
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-white/60 pointer-events-none shrink-0" strokeWidth={2} />
              <span className="text-sm md:text-base font-medium text-white/60 pointer-events-none select-none tracking-wide">
                {isRequestingPermission
                  ? t.input.requesting
                  : hasMicPermission
                  ? t.input.holdToSpeak
                  : t.input.enableMic}
              </span>
            </motion.div>
          ) : (
             // ── Feature Disabled Fallback ──
             <motion.div key="disabled" className="flex items-center justify-center text-white/30 text-sm">
                 Microphone Disabled
             </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
