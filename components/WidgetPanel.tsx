"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLiveKitVoiceChat } from "../hooks/useLiveKitVoiceChat";
import { TranslationKey, translations } from "@/utils/translations";
import WidgetView from "./WidgetView";

interface WidgetPanelProps {
  isOpen: boolean; 
  onClose: () => void;
}

const LANGUAGES = [
  { code: "en", name: "English", countryCode: "US" as const },
  { code: "de", name: "Deutsch", countryCode: "DE" as const },
  { code: "tr", name: "Türkçe", countryCode: "TR" as const },
  { code: "es", name: "Español", countryCode: "ES" as const },
  { code: "fr", name: "Français", countryCode: "FR" as const },
  { code: "it", name: "Italiano", countryCode: "IT" as const },
  { code: "pt", name: "Português", countryCode: "PT" as const },
  { code: "nl", name: "Nederlands", countryCode: "NL" as const },
  { code: "pl", name: "Polski", countryCode: "PL" as const },
  { code: "ar", name: "العربية", countryCode: "SA" as const },
];

export default function WidgetPanel({ isOpen, onClose }: WidgetPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Environment variables with defaults
  const enableLanguageSwitch = process.env.NEXT_PUBLIC_ENABLE_LANGUAGE_SWITCH !== 'false';
  const defaultLanguage = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE as TranslationKey) || "de";

  const [selectedLanguage, setSelectedLanguage] = useState<TranslationKey>(defaultLanguage);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  const t = useMemo(() => translations[selectedLanguage], [selectedLanguage]);

  const loadingMessages = useMemo(
    () => [
      t.loading.step1, 
      t.loading.step2, 
      t.loading.step3, 
      t.loading.step4, 
    ],
    [t]
  );

  const {
    messages,
    isAgentTyping,
    isConnected,
    isMicMuted,
    isAgentActive,
    products,
    quickReplies,
    isAgentConnected,
    agentVideoElement,
    isAgentVideoEnabled,
    isVideoModeEnabled,
    initializeConnection,
    disconnectRoom,
    sendTextMessage,
    toggleMicrophone,
    setGeneratedImages,
    generatedImages,
    isAgentMuted,
    toggleAgentMute,
    sendLanguageChange,
    setMicrophoneEnabled, 
    setProducts,
    connectionStage, 
  } = useLiveKitVoiceChat();

  const handleLanguageChange = async (code: string) => {
    setSelectedLanguage(code as TranslationKey);
    if (isConnected) {
      await sendLanguageChange(code);
    }
  };
  
  const handleClearGeneratedImages = () => setGeneratedImages([]);
  
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  const visibleMessages = useMemo(() => {
    if (messages.length === 0) return [];
    const lastUserMessage = [...messages].reverse().find(m => m.sender === "user");
    const lastAgentMessage = [...messages].reverse().find(m => m.sender === "agent");
    const result = [];
    if (lastUserMessage) result.push(lastUserMessage);
    if (lastAgentMessage) result.push(lastAgentMessage);
    return result;
  }, [messages]);

  // --- Initialize on Open ---
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setShowLoading(true);
      setLoadingStep(0);
      initializeConnection();
    }
  }, [isOpen, initializeConnection]);

  // --- REAL LOADING LOGIC ---
  useEffect(() => {
    if (!showLoading) return;

    switch (connectionStage) {
      case 'idle':
      case 'fetching_token':
        setLoadingStep(0);
        break;
      case 'connecting_room':
        setLoadingStep(1);
        break;
      case 'waiting_agent':
        setLoadingStep(2);
        break;
      case 'connected':
        setLoadingStep(3);
        setTimeout(() => setShowLoading(false), 100);
        break;
      case 'failed':
        setLoadingStep(3); 
        break;
    }
  }, [connectionStage, showLoading]);

  // Cleanup on Close
  useEffect(() => {
    if (!isOpen && hasInitializedRef.current) {
      hasInitializedRef.current = false;
      setShowLoading(true);
      setShowHistory(false);
      disconnectRoom();
    }
  }, [isOpen, disconnectRoom]);

  // ✅ اضافه شدن منطق تایمر ۱۰ ثانیه‌ای عدم فعالیت (Inactivity Timeout)
  useEffect(() => {
    if (!isOpen) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        onClose(); // بستن پنل در صورت عدم فعالیت پس از ۱۰ ثانیه
      }, 60000); 
    };

    // مقداردهی اولیه تایمر
    resetTimer();

    // لیست رویدادهایی که فعالیت کاربر محسوب می‌شوند
    const events = ['mousedown', 'touchstart', 'keydown'];

    // اتصال Event Listener ها در فاز Capture برای گرفتن همه کلیک‌ها/لمس‌ها
    events.forEach(event => document.addEventListener(event, resetTimer, true));

    // پاک‌سازی تایمر و Event Listener ها در هنگام Unmount یا بسته شدن
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer, true));
    };
  }, [isOpen, onClose]);

  // --- RETRY LOGIC ---
  const handleRetryConnection = async () => {
    console.log("🔄 Retrying connection...");
    await disconnectRoom();
    setLoadingStep(0);
    setShowLoading(true);
    setTimeout(() => {
        initializeConnection();
    }, 100);
  };

  const handleClearProducts = () => setProducts([]);

  const handleSend = async () => {
    if (inputValue.trim() && isConnected) {
      await sendTextMessage(inputValue);
      setInputValue("");
    }
  };

  const handleQuickReplySelect = async (value: string) => {
    if (isConnected) await sendTextMessage(value);
  };

  const handleMicPress = useCallback(() => {
    if (!isConnected) return;
    setMicrophoneEnabled(true);
  }, [isConnected, setMicrophoneEnabled]);

  const handleMicRelease = useCallback(() => {
    if (!isConnected) return;
    setMicrophoneEnabled(false);
  }, [isConnected, setMicrophoneEnabled]);

  return (
    <WidgetView
      isOpen={isOpen}
      onClose={onClose}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      showLoading={showLoading}
      loadingStep={loadingStep}
      loadingMessages={loadingMessages}
      generatedImages={generatedImages}
      onClearGeneratedImages={handleClearGeneratedImages}
      initializeConnection={handleRetryConnection}

      selectedLanguage={selectedLanguage}
      onLanguageChange={handleLanguageChange}
      t={t}
      LANGUAGES={LANGUAGES}
      enableLanguageSwitch={enableLanguageSwitch}

      messages={visibleMessages}
      fullHistory={messages}

      inputValue={inputValue}
      setInputValue={setInputValue}
      onSend={handleSend}
      isAgentTyping={isAgentTyping}

      isConnected={isConnected}
      isAgentConnected={isAgentConnected}
      isMicMuted={isMicMuted}
      onMicPress={handleMicPress}
      onMicRelease={handleMicRelease}
      isAgentMuted={isAgentMuted}
      toggleAgentMute={toggleAgentMute}

      isVideoModeEnabled={isVideoModeEnabled}
      isAgentVideoEnabled={isAgentVideoEnabled}
      agentVideoElement={agentVideoElement}
      isAgentActive={isAgentActive}

      products={products}
      onClearProducts={handleClearProducts}

      quickReplies={quickReplies}
      onQuickReplySelect={handleQuickReplySelect}

      messagesContainerRef={messagesContainerRef}   
      input={inputRef}            
    />
  );
}
