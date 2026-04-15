"use client";

import { motion, AnimatePresence } from "framer-motion";

interface QuickReply {
  label: string;
  value: string;
}

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (value: string) => void;
  isVisible: boolean;
}

export default function QuickReplies({ replies, onSelect, isVisible }: QuickRepliesProps) {
  if (replies.length === 0 || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="quick-replies-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative md:absolute md:bottom-full left-0 right-0 pb-2 md:pb-3 px-2 md:px-4"
      >
        <div className="flex flex-wrap gap-2 justify-center items-center">
          {replies.map((reply, index) => (
            <motion.button
              key={`${reply.value}-${index}`}
              onClick={() => onSelect(reply.value)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.2,
                ease: "easeOut"
              }}
              whileTap={{ scale: 0.95 }}
              className="
                px-3.5 py-2 rounded-lg text-xs font-medium
                text-white bg-blue-900/70 backdrop-blur-sm
                border border-slate-600/50 transition-all
                hover:bg-blue-600/90 hover:border-slate-500/60
                active:scale-95 shadow-lg
              "
            >
              {reply.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
