// hooks/useMockVoiceChat.ts
import { useState, useCallback } from "react";

export function useMockVoiceChat() {
  // --- States ---
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  
  // Connection States
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  
  // Interaction States
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isAgentMuted, setIsAgentMuted] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  
  // Video States
  const [isAgentVideoEnabled, setIsAgentVideoEnabled] = useState(false);
  const [isVideoModeEnabled, setIsVideoModeEnabled] = useState(false);

  // --- Actions ---

  const initializeConnection = useCallback(async () => {
    console.log("🔌 Mock: Connecting...");
    setTimeout(() => {
      setIsConnected(true);
      setIsAgentConnected(true);
      setMessages([{ 
        sender: "agent", 
        text: "سلام! من آماده تست هستم. سناریوی مورد نظر را انتخاب کنید.", 
        timestamp: Date.now() 
      }]);
    }, 1000);
  }, []);

  const disconnectRoom = useCallback(async () => {
    setIsConnected(false);
    setIsAgentConnected(false);
    setMessages([]);
    setProducts([]);
    setQuickReplies([]);
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    setMessages(prev => [...prev, { sender: "user", text, timestamp: Date.now() }]);
    setIsAgentTyping(true);
    setTimeout(() => {
      setIsAgentTyping(false);
      setMessages(prev => [...prev, { 
        sender: "agent", 
        text: `دریافت شد: ${text}`, 
        timestamp: Date.now() 
      }]);
    }, 1000);
  }, []);

  const toggleMicrophone = () => setIsMicMuted(!isMicMuted);
  const toggleAgentMute = () => setIsAgentMuted(!isAgentMuted);
  const sendLanguageChange = async (code: string) => console.log(`🌐 Mock: Language switched to ${code}`);

  // --- 🔥 Advanced Scenarios for Data Stress Testing ---
  const simulateScenario = (type: string) => {
      // Clear previous transient states
      setQuickReplies([]);
      
      switch(type) {
          case 'ecommerce_simple':
              setMessages(prev => [...prev, { sender: 'agent', text: 'یک محصول ساده:', timestamp: Date.now() }]);
              setProducts([
                  { 
                      name: "Simple iPhone 15", 
                      price: "999", 
                      image: "https://via.placeholder.com/300x200/111/fff?text=iPhone", 
                      link: "#" 
                  }
              ]);
              break;

          case 'product_multi_image':
              setMessages(prev => [...prev, { sender: 'agent', text: 'محصول با چند تصویر (برای تست گالری):', timestamp: Date.now() }]);
              setProducts([
                  { 
                      name: "Luxury Watch (Gallery Test)", 
                      price: "12500", 
                      // ✅ Array of images
                      image: [
                          "https://via.placeholder.com/300x200/000/fff?text=Front+View",
                          "https://via.placeholder.com/300x200/333/fff?text=Side+View",
                          "https://via.placeholder.com/300x200/666/fff?text=Back+View",
                          "https://via.placeholder.com/300x200/999/fff?text=On+Wrist"
                      ], 
                      link: "#" 
                  }
              ]);
              break;

          case 'product_complex_prices':
              setMessages(prev => [...prev, { sender: 'agent', text: 'محصولات با فرمت‌های عجیب قیمت:', timestamp: Date.now() }]);
              setProducts([
                  { name: "No Price Item", price: null, image: "https://via.placeholder.com/300x200?text=Null", link: "#" },
                  { name: "String Price", price: "Contact Us", image: "https://via.placeholder.com/300x200?text=String", link: "#" },
                  { name: "Dirty Price", price: "USD 1,200.50", image: "https://via.placeholder.com/300x200?text=Dirty", link: "#" },
                  { name: "Zero Price", price: 0, image: "https://via.placeholder.com/300x200?text=Zero", link: "#" }
              ]);
              break;

          case 'quick_reply_stress':
               setMessages(prev => [...prev, { sender: 'agent', text: 'تست انواع دکمه‌های پاسخ سریع:', timestamp: Date.now() }]);
               // Simulating the diverse JSON structures handled in useLiveKitVoiceChat
               setQuickReplies([
                   { label: "Short", value: "short" },
                   { label: "A Very Long Button Text To Test Wrap", value: "long" },
                   { label: "Emoji 🚀", value: "emoji" },
                   { label: "فارسی راست‌چین", value: "fa" }
               ]);
               break;

          case 'video_mode':
              setIsVideoModeEnabled(true);
              setIsAgentVideoEnabled(true);
              setIsAgentSpeaking(true);
              break;

          case 'error_state':
              setMessages(prev => [...prev, { sender: 'agent', text: '⚠️ Connection lost.', timestamp: Date.now() }]);
              setIsAgentConnected(false);
              break;
      }
  };

  return {
    messages,
    products,
    quickReplies,
    isConnected,
    isAgentConnected,
    isMicMuted,
    isAgentMuted,
    isAgentTyping,
    isAgentSpeaking,
    isAgentActive: isAgentSpeaking || isAgentTyping,
    agentVideoElement: null,
    isAgentVideoEnabled,
    isVideoModeEnabled,
    initializeConnection,
    disconnectRoom,
    sendTextMessage,
    toggleMicrophone,
    toggleAgentMute,
    sendLanguageChange,
    setProducts,
    
    controls: {
        setMessages,
        setProducts,
        setQuickReplies,
        setIsAgentTyping,
        setIsAgentSpeaking,
        setIsAgentConnected,
        setIsVideoModeEnabled,
        setIsAgentVideoEnabled,
        simulateScenario
    }
  };
}
