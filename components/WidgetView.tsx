"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, QrCode, UserPlus, Headset, Mail, Phone } from "lucide-react";
import ChatInput from "./ui/ChatInput";
import LoadingOverlay from "./ui/LoadingOverlay";
import QuickReplies from "./ui/QuickReplies";
import AgentVideo from "./ui/AgentVideo";
import ChatHistory from "./ui/HistoryButton"; 
import { TranslationKey } from "@/utils/translations";
import MessagesList from "./ui/MessagesList";
import EcosystemCatalog from "./ui/ProductCatalog";

export interface WidgetViewProps {
  input: React.RefObject<HTMLInputElement>;
  isOpen: boolean;
  onClose: () => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showLoading: boolean;
  loadingStep: number;
  loadingMessages: string[];
  generatedImages: any[]; 
  onClearGeneratedImages: () => void; 
  initializeConnection: () => void;
  selectedLanguage: TranslationKey;
  onLanguageChange: (code: string) => void;
  t: any;
  LANGUAGES: { code: string; name: string; countryCode: any }[];
  enableLanguageSwitch?: boolean;
  messages: any[];
  fullHistory: any[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
  isAgentTyping: boolean;
  isConnected: boolean;
  isAgentConnected: boolean;
  isMicMuted: boolean;
  onMicPress: () => void;
  onMicRelease: () => void;
  isAgentMuted: boolean;
  toggleAgentMute: () => void;
  isVideoModeEnabled: boolean;
  isAgentVideoEnabled: boolean;
  agentVideoElement: HTMLVideoElement | null;
  isAgentActive: boolean;
  products: any[];
  onClearProducts: () => void;
  quickReplies: any[];
  onQuickReplySelect: (val: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const MOCK_SUGGESTED_QUESTIONS = [
  "How do I get started?",
  "Show me pricing plans",
  "Contact technical support",
  "Where are you located?"
];

const MOTION = {
  ease: [0.22, 1, 0.36, 1],
  duration: { instant: 0.15, fast: 0.3, normal: 0.5 },
} as const;

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function WidgetView(props: WidgetViewProps) {
  const {
    isOpen, onClose, showHistory, selectedLanguage, t, showLoading, loadingStep, loadingMessages, initializeConnection,
    messages, fullHistory, inputValue, setInputValue, onSend, isAgentTyping, isConnected, isAgentConnected, isMicMuted,
    onMicPress, onMicRelease, isAgentMuted, toggleAgentMute, isVideoModeEnabled, isAgentVideoEnabled, agentVideoElement,
    isAgentActive, products, onClearProducts, generatedImages, onClearGeneratedImages, quickReplies, onQuickReplySelect,
    messagesContainerRef, input
  } = props;

  const isRTL = selectedLanguage === "ar";
  
  // State for handling which modal is currently expanded
  const [activeModal, setActiveModal] = useState<'qr' | 'details' | 'support' | null>(null);

  const closeModal = () => setActiveModal(null);

  // Content configuration for modals
  const modalContent = {
qr: {
      icon: <QrCode className="w-[100px] h-[100px] md:w-[180px] md:h-[180px] text-[#1D1D1F]" strokeWidth={1} />,
      title: "Access on Mobile",
      description: "Scan this QR code to quickly open and use our AI assistant on your smartphone at any time.",
      buttonText: "Done"
    },
    details: {
      icon: <UserPlus className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] text-[#0066CC] mb-2 md:mb-4" strokeWidth={1} />,
      title: "Share Contact Info",
      description: "Approve this request to let the AI securely collect your contact details for future follow-ups by our team.",
      buttonText: "Authorize AI"
    },
    support: {
      icon: <Headset className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] text-[#0066CC] mb-2 md:mb-4" strokeWidth={1} />,
      title: "Contact Human Support",
      description: "Forward your inquiry to our technical team. A human specialist will review your request and get back to you.",
      buttonText: "Submit Request"
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="widget-root"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: MOTION.duration.normal, ease: MOTION.ease }}
          className="fixed inset-0 w-full h-[100dvh] z-50 flex flex-col overflow-hidden widget-global-font bg-[#F5F5F7] safe-area-top safe-area-bottom"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* ✨ PREMIUM ORGANIC MESH GRADIENTS */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-[#0066CC]/15 rounded-[100%] blur-[160px] pointer-events-none mix-blend-multiply animate-drift" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[80%] bg-[#E5B89B]/20 rounded-[100%] blur-[180px] pointer-events-none mix-blend-multiply animate-drift" style={{ animationDelay: '-7s' }} />
          <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] bg-[#F5F5F7]/40 rounded-full blur-[100px] pointer-events-none mix-blend-overlay animate-drift" style={{ animationDelay: '-13s' }} />

          <div className="w-full h-full flex flex-col relative z-10 backdrop-blur-[60px] bg-white/20 border-x border-white/40 shadow-[0_0_60px_rgba(0,0,0,0.03)] gpu-layer">

            {/* ─── ROW 1: HEADER ─── */}
            <header className="h-[6%] min-h-[52px] md:min-h-[64px] w-full flex-shrink-0 border-b border-white/30 bg-white/10 px-4 md:px-8 flex items-center justify-between relative">
              <div className="flex items-center z-10 min-w-[100px]">
                <button
                  onClick={onClose}
                  className="p-2.5 md:p-3 bg-white/40 hover:bg-white/60 rounded-full border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 active:scale-90 group touch-manipulation"
                  aria-label="Close"
                >
                  <X size={18} className="md:w-5 md:h-5 text-[#1D1D1F] group-hover:text-black transition-colors" strokeWidth={2.5} />
                </button>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none z-10">
                <span className="text-[#1D1D1F] font-bold text-lg md:text-xl tracking-tight leading-tight">
                  Ayand AI
                </span>
              </div>

              <div className="flex justify-end z-10 min-w-max">
                <button 
                  onClick={toggleAgentMute} 
                  className="flex items-center gap-2 md:gap-3 bg-white/40 hover:bg-white/60 p-1.5 pr-2.5 md:pr-4 rounded-full border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 active:scale-90 group cursor-pointer touch-manipulation"
                >
                  <div className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isAgentMuted 
                      ? "bg-[#FF3B30]/10 text-[#FF3B30]" 
                      : "bg-white text-[#1D1D1F] shadow-sm"
                  }`}>
                    {isAgentMuted ? <VolumeX size={16} strokeWidth={2} /> : <Volume2 size={16} strokeWidth={2} />}
                  </div>
                  <span className={`hidden md:inline text-[12px] font-bold tracking-wider select-none whitespace-nowrap transition-colors ${
                    isAgentMuted ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'
                  }`}>
                    {isAgentMuted ? "MUTED" : "SOUND ON"}
                  </span>
                </button>
              </div>
            </header>

            {/* ─── MAIN CONTENT ─── */}
            <AnimatePresence mode="wait" initial={false}>
              {showHistory ? (
                <motion.div
                  key="history-view"
                  variants={pageVariants}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ duration: MOTION.duration.normal, ease: MOTION.ease }}
                  className="flex-1 flex flex-col h-[94%] relative z-10 p-8"
                >
                  <ChatHistory messages={fullHistory} />
                </motion.div>
              ) : (
                <motion.div
                  key="chat-interface"
                  variants={pageVariants}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ duration: MOTION.duration.normal, ease: MOTION.ease }}
                  className="flex-1 flex flex-col h-[94%] w-full relative z-10"
                >
                  
                  {/* ─── ROW 2: SPLIT VIEW ─── */}
                  <div style={{ flex: 35 }} className="w-full flex flex-col md:flex-row gap-4 md:gap-8 p-4 md:p-8 border-b border-white/20 min-h-0 relative overflow-auto md:overflow-hidden">
                    <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6 min-w-0 md:h-full relative z-10">
                      <div className="flex-1 min-h-[180px] md:min-h-0 bg-white/30 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[20px] md:rounded-[32px] flex items-center justify-center overflow-hidden relative transition-all duration-500 hover:bg-white/40 group">
                             <AgentVideo videoElement={agentVideoElement} isVideoEnabled={isAgentVideoEnabled} isAgentConnected={isAgentConnected} />
                      </div>
                      <div className="shrink-0 flex flex-col gap-4">
                         {quickReplies.length > 0 && (
                            <QuickReplies replies={quickReplies} onSelect={onQuickReplySelect} isVisible={true} />
                         )}
                         <ChatInput
                            inputValue={inputValue} isMicMuted={isMicMuted} isConnected={isConnected}
                            onInputChange={setInputValue} onSend={onSend} onMicPress={onMicPress} onMicRelease={onMicRelease}
                            inputRef={input} t={t}
                          />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-5 min-w-0 max-h-[40vh] md:max-h-none md:h-full relative z-10">
                      <div className="flex-1 bg-white/30 backdrop-blur-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[20px] md:rounded-[32px] overflow-y-auto custom-scrollbar smooth-scroll p-4 md:p-6" ref={messagesContainerRef}>
                        <MessagesList
                          messages={messages} isAgentTyping={isAgentTyping} products={products}
                          onClearProducts={onClearProducts} generatedImages={generatedImages} onClearGeneratedImages={onClearGeneratedImages}
                          t={t}
                        />
                      </div>
                      <div className="shrink-0 flex gap-3 overflow-x-auto hide-scrollbar snap-scroll pb-1 pt-1 px-1 touch-pan-x">
                        {MOCK_SUGGESTED_QUESTIONS.map((question, index) => (
                          <button 
                            key={index}
                            className="whitespace-nowrap px-4 md:px-6 py-2.5 md:py-3.5 bg-white/50 hover:bg-white/80 border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-[#1D1D1F] font-medium text-[13px] md:text-[15px] rounded-full transition-all duration-300 active:scale-95 touch-manipulation"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ─── ROW 3: PRODUCTS ─── */}
                  <div style={{ flex: 53 }} className="w-full flex flex-col border-b border-white/20 min-h-0 gap-3 md:gap-5 max-h-[35vh] md:max-h-none">
                    <div className="flex-1 overflow-y-auto custom-scrollbar smooth-scroll relative bg-white/20 backdrop-blur-[10px] rounded-[24px] md:rounded-[36px] border border-white/40 p-2 md:p-6 shadow-inner">
                      <EcosystemCatalog 
                        onAskAssistant={(productName) => {
                           setInputValue(`Can you give me more technical details about the ${productName}?`);
                           input.current?.focus();
                        }} 
                      />
                    </div>
                  </div>

                  {/* ─── ROW 4: TOOLS (Updated with closed-state descriptions) ─── */}
                  <div style={{ flex: 12 }} className="w-full flex flex-row gap-3 md:gap-6 px-3 py-2 md:px-8 md:py-5 min-h-0">

                     {/* 1. Mobile Handoff (QR Code) */}
                     <div
                        onClick={() => setActiveModal('qr')}
                        className="flex-1 bg-white/50 hover:bg-white/80 backdrop-blur-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-400 border border-white/60 rounded-[16px] md:rounded-[28px] flex flex-row items-center justify-center md:justify-start px-3 md:px-6 gap-3 md:gap-5 cursor-pointer group active:scale-[0.98] relative overflow-hidden"
                     >
                        <div className="bg-white/80 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                          <QrCode className="w-6 h-6 md:w-10 md:h-10 text-[#1D1D1F]" strokeWidth={1.5} />
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                          <span className="text-[#1D1D1F] text-[16px] font-bold tracking-tight">Mobile Handoff</span>
                          <span className="text-[#515154] text-[13px] font-medium mt-0.5">Scan to sync chat to phone</span>
                        </div>
                     </div>

                     {/* 2. User Information Request */}
                     <div
                        onClick={() => setActiveModal('details')}
                        className="flex-1 bg-white/50 hover:bg-white/80 backdrop-blur-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-400 border border-white/60 rounded-[16px] md:rounded-[28px] flex flex-row items-center justify-center md:justify-start px-3 md:px-6 gap-3 md:gap-5 cursor-pointer group active:scale-[0.98]"
                     >
                        <div className="bg-white/80 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-white group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                          <UserPlus className="w-6 h-6 md:w-9 md:h-9 text-[#1D1D1F] group-hover:text-[#0066CC] transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                          <span className="text-[#1D1D1F] text-[16px] font-bold tracking-tight">Share Details</span>
                          <span className="text-[#515154] text-[13px] font-medium mt-0.5">Provide info for follow-ups</span>
                        </div>
                     </div>

                     {/* 3. Live Support */}
                     <div
                        onClick={() => setActiveModal('support')}
                        className="flex-1 bg-white/50 hover:bg-white/80 backdrop-blur-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-400 border border-white/60 rounded-[16px] md:rounded-[28px] flex flex-row items-center justify-center md:justify-start px-3 md:px-6 gap-3 md:gap-5 cursor-pointer group active:scale-[0.98]"
                     >
                        <div className="bg-white/80 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-white group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                          <Headset className="w-6 h-6 md:w-9 md:h-9 text-[#1D1D1F] group-hover:text-[#0066CC] transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                          <span className="text-[#1D1D1F] text-[16px] font-bold tracking-tight">Live Support</span>
                          <span className="text-[#515154] text-[13px] font-medium mt-0.5">Connect to a human agent</span>
                        </div>
                     </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── DYNAMIC MODAL (For QR, Details, Support) ─── */}
          <AnimatePresence>
            {activeModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1D1D1F]/40 backdrop-blur-md"
                onClick={closeModal}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 15 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white/95 backdrop-blur-3xl p-6 md:p-10 rounded-[28px] md:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col items-center gap-4 md:gap-6 max-w-[90vw] md:max-w-[500px] text-center mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 flex items-center justify-center">
                    {modalContent[activeModal].icon}
                  </div>
                  
                  <div className="flex flex-col gap-2 md:gap-3 px-2 md:px-4">
                    <h3 className="text-[#1D1D1F] text-xl md:text-2xl font-bold tracking-tight">
                      {modalContent[activeModal].title}
                    </h3>
                    <p className="text-[#515154] text-[15px] leading-relaxed font-medium">
                      {modalContent[activeModal].description}
                    </p>
                  </div>

                  <div className="flex gap-3 md:gap-4 mt-1 md:mt-2 w-full">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 md:py-3.5 bg-gray-100 text-[#1D1D1F] rounded-full font-semibold text-[15px] hover:bg-gray-200 transition-all active:scale-[0.97] touch-manipulation"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 md:py-3.5 bg-[#0066CC] text-white rounded-full font-semibold text-[15px] hover:bg-[#0055AA] transition-all shadow-lg shadow-blue-500/20 active:scale-[0.97] touch-manipulation"
                    >
                      {modalContent[activeModal].buttonText}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            .widget-global-font {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(134, 134, 139, 0.3); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(134, 134, 139, 0.6); }

            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
   );
}
