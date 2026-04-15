// hooks/useLiveKitVoiceChat.ts
import { useState, useEffect, useRef, useCallback } from "react";
import {
  setLogLevel,
  LogLevel,
  Room,
  RoomEvent,
  Track,
  Participant,
  ParticipantEvent,
  TextStreamReader,
  TranscriptionSegment,
  RemoteTrackPublication,
} from "livekit-client";
import { getConnectionDetails } from "../utils/livekitUtils";

// تعریف مراحل واقعی اتصال برای استفاده در UI
export type ConnectionStage = 
  | 'idle' 
  | 'fetching_token'   // دریافت توکن
  | 'connecting_room'  // اتصال به سرور
  | 'waiting_agent'    // اتصال برقرار شد، منتظر پاسخ (صوتی یا متنی)
  | 'connected'        // دریافت اولین پیام یا صدا -> آماده
  | 'failed';          // خطا

interface Message {
  sender: "user" | "agent";
  text: string;
  timestamp: number;
  streamId?: string;
  final?: boolean;
}

interface Product {
  name: string;
  image: string | string[];
  link: string;
  price?: number | string | null;
}

// ✅ اینترفیس جدید برای تصاویر تولید شده
export interface GeneratedImage {
  image_url: string;
  description?: string;
}

interface QuickReply {
  label: string;
  value: string;
}

export function useLiveKitVoiceChat() {
  // Data States
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]); // ✅ استیت جدید
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  
  // Connection & Stage States
  const [connectionStage, setConnectionStage] = useState<ConnectionStage>('idle'); 
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  
  // Interaction States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isAgentVideoEnabled, setIsAgentVideoEnabled] = useState(false);
  const [isAgentMuted, setIsAgentMuted] = useState(false);

  // Refs
  const roomRef = useRef<Room | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const agentVideoRef = useRef<HTMLVideoElement | null>(null);
  const initInProgressRef = useRef(false);
  const currentAgentSessionRef = useRef<string | null>(null);
  const stopMicTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isVideoModeEnabled = process.env.NEXT_PUBLIC_ENABLE_AGENT_VIDEO === "true";
  setLogLevel(LogLevel.silent);

  // --- Handlers ---

  const setupUserSpeechTranscription = useCallback((room: Room) => {
    room.on(
      RoomEvent.TranscriptionReceived,
      (segments: TranscriptionSegment[], participant?: Participant) => {
        segments.forEach((segment) => {
          const text = segment.text?.trim();
          if (!text) return;

          const isAgent =
            participant?.identity?.toLowerCase().includes("agent") ||
            participant?.name?.toLowerCase().includes("agent");

          if (isAgent) return;

          if (segment.final) {
            setQuickReplies([]);
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.text === text && lastMessage?.sender === "user") return prev;
              return [
                ...prev,
                {
                  sender: "user",
                  text,
                  timestamp: Date.now(),
                  streamId: segment.id,
                  final: segment.final,
                },
              ];
            });
          }
        });
      }
    );
  }, []);

  const setupTextStreams = useCallback((room: Room) => {
    room.registerTextStreamHandler("message", async (reader: TextStreamReader) => {
      const text = await reader.readAll();
      if (!text) return;

      try {
        const json = JSON.parse(text);
        if (json.agent_response) {
          const agentText = json.agent_response.trim();
          setConnectionStage((prev) => (prev === 'waiting_agent' ? 'connected' : prev));

          setMessages((prev) => [
            ...prev,
            { sender: "agent", text: agentText, timestamp: Date.now() },
          ]);
          setIsAgentTyping(false);
          setTimeout(() => setIsAgentTyping(false), 500);
        }
      } catch (err) {
        // console.error("❌ Error parsing message:", err);
      }
    });
  }, []);

  const setupProductsStream = useCallback((room: Room) => {
    room.registerTextStreamHandler("products", async (reader: TextStreamReader) => {
      const text = await reader.readAll();
      console.log("📦 Products stream received:", text);
      if (!text) return;

      try {
        const json = JSON.parse(text);
        const productArray = Array.isArray(json) ? json : json.products;
        if (Array.isArray(productArray)) {
          const mappedProducts = productArray.map((p: any) => ({
            name: p.product_name,
            image: p.image,
            link: p.url,
            price: p.price ?? p.product_price ?? null,
          }));
          setProducts(mappedProducts);
          // اگر محصول جدید آمد، عکس‌های قبلی پاک شوند (اختیاری بر اساس لاجیک)
          setGeneratedImages([]); 
        }
      } catch (err) {
        // console.error("❌ Invalid JSON in products topic:", err);
      }
    });
  }, []);

  // ✅ هندلر جدید برای دریافت تصاویر شبکه اجتماعی
  const setupImagesStream = useCallback((room: Room) => {
    room.registerTextStreamHandler("img", async (reader: TextStreamReader) => {
      const text = await reader.readAll();
      console.log("🎨 Images stream received:", text);
      if (!text) return;

      try {
        const json = JSON.parse(text);
        // پشتیبانی از ساختار { "images": [...] } یا آرایه مستقیم
        const imagesArray = Array.isArray(json) ? json : json.images;
        
        if (Array.isArray(imagesArray)) {
          const mappedImages: GeneratedImage[] = imagesArray.map((img: any) => ({
            image_url: img.image_url,
            description: img.description || "",
          }));
          
          setGeneratedImages(mappedImages);
          // وقتی عکس می‌آید، محصولات قبلی را پاک می‌کنیم تا تداخل UI پیش نیاید
          setProducts([]); 
        }
      } catch (err) {
        console.error("❌ Invalid JSON in img topic:", err);
      }
    });
  }, []);

  const setupAnswersStream = useCallback((room: Room) => {
    room.registerTextStreamHandler("trigger", async (reader: TextStreamReader) => {
      const text = await reader.readAll();
      if (!text) return;

      try {
        const json = JSON.parse(text);
        let mappedReplies: QuickReply[] = [];

        if (Array.isArray(json)) {
          mappedReplies = json.map((item: any) => ({
            label: item.label || item.text || item.value || "",
            value: (item.value || item.label || item.text || "").replace(/_/g, " "),
          }));
        } else if (typeof json === 'object' && !json.answers) {
          mappedReplies = Object.entries(json).map(([key, value]) => ({
            label: String(value),
            value: String(key).replace(/_/g, " "),
          }));
        } else if (json.answers) {
          const answersArray = json.answers;
          if (Array.isArray(answersArray)) {
            mappedReplies = answersArray.map((item: any) => ({
              label: item.label || item.text || "",
              value: (item.value || item.label || item.text || "").replace(/_/g, " "),
            }));
          } else if (typeof answersArray === 'object') {
            mappedReplies = Object.entries(answersArray).map(([key, value]) => ({
              label: String(value),
              value: String(key).replace(/_/g, " "),
            }));
          }
        }
        
        if (mappedReplies.length > 0) {
          setQuickReplies(mappedReplies);
        }
      } catch (err) {
        // console.error("❌ Invalid JSON in trigger topic:", err);
      }
    });
  }, []);

  const setupCleanProductsStream = useCallback((room: Room) => {
    room.registerTextStreamHandler("clean", async (reader: TextStreamReader) => {
      const text = await reader.readAll();
      console.log("🧹 Clean stream received:", text);
      setProducts([]);
      setGeneratedImages([]); // ✅ پاک کردن عکس‌ها در دستور clean
    });
  }, []);

  const setupVideoHandler = useCallback((room: Room) => {
    if (!isVideoModeEnabled) return;
    const handleVideoTrack = (track: Track, publication: RemoteTrackPublication, participant: Participant) => {
      if (!participant.identity.toLowerCase().includes("agent")) return;
      if (track.kind === Track.Kind.Video) {
        if (!agentVideoRef.current) {
          agentVideoRef.current = document.createElement("video");
          agentVideoRef.current.autoplay = true;
          agentVideoRef.current.playsInline = true;
          agentVideoRef.current.muted = true;
        }
        track.attach(agentVideoRef.current);
        setIsAgentVideoEnabled(true);
        track.on("ended", () => {
          if (agentVideoRef.current) track.detach(agentVideoRef.current);
          setIsAgentVideoEnabled(false);
        });
      }
    };
    room.on(RoomEvent.TrackSubscribed, handleVideoTrack);
    Array.from(room.remoteParticipants.values()).forEach((participant) => {
      participant.videoTrackPublications.forEach((publication) => {
        if (publication.isSubscribed && publication.videoTrack) {
          handleVideoTrack(publication.videoTrack, publication, participant);
        }
      });
    });
    room.on(RoomEvent.Disconnected, () => {
      if (agentVideoRef.current) agentVideoRef.current.srcObject = null;
      setIsAgentVideoEnabled(false);
    });
  }, [isVideoModeEnabled]);

  const setupAgentSpeakingHandler = useCallback((room: Room) => {
    const setupAudioDetection = (participant: Participant) => {
      if (!participant.identity.toLowerCase().includes("agent")) return;
      setIsAgentConnected(true);
      const checkForAudioTrack = () => {
        participant.audioTrackPublications.forEach((publication) => {
          if (publication.audioTrack && publication.isSubscribed) {
            setConnectionStage((prev) => (prev === 'waiting_agent' ? 'connected' : prev));
            const track = publication.audioTrack;
            const mediaStream = new MediaStream([track.mediaStreamTrack]);
            const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            const audioContext = new AudioCtx();
            const source = audioContext.createMediaStreamSource(mediaStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            let lastSpeakingState = false;
            let rafId: number;
            const detectSpeaking = () => {
              analyser.getByteFrequencyData(dataArray);
              const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
              const isSpeaking = avg > 5;
              if (isSpeaking !== lastSpeakingState) {
                lastSpeakingState = isSpeaking;
                setIsAgentSpeaking(isSpeaking);
              }
              rafId = requestAnimationFrame(detectSpeaking);
            };
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const startAnalyser = () => {
              if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
              detectSpeaking();
            };
            if (isSafari) {
              setTimeout(() => {
                audioContext.resume().then(() => detectSpeaking()).catch(() => {});
              }, 300);
              document.addEventListener("click", startAnalyser, { once: true });
              document.addEventListener("touchstart", startAnalyser, { once: true });
            } else {
              startAnalyser();
            }
            track.on("ended", () => {
              cancelAnimationFrame(rafId);
              audioContext.close().catch(() => {});
              setIsAgentSpeaking(false);
            });
          }
        });
      };
      checkForAudioTrack();
      participant.on(ParticipantEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) checkForAudioTrack();
      });
    };
    Array.from(room.remoteParticipants.values()).forEach(setupAudioDetection);
    room.on(RoomEvent.ParticipantConnected, setupAudioDetection);
    room.on(RoomEvent.Disconnected, () => {
      setIsAgentSpeaking(false);
      setIsAgentConnected(false);
      setConnectionStage('idle');
    });
  }, []);

  const initializeConnection = useCallback(async () => {
    if (initInProgressRef.current || roomRef.current) return;
    initInProgressRef.current = true;
    setConnectionStage('fetching_token');

    try {
      const details = await getConnectionDetails();
      setConnectionStage('connecting_room');

      const room = new Room({ 
        adaptiveStream: true, 
        dynacast: true, 
        disconnectOnPageLeave: true 
      });
      roomRef.current = room;
      audioRef.current = new Audio();
      audioRef.current.autoplay = true;

      room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.attach(audioRef.current);
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.detach(audioRef.current);
        }
      });
      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setIsAgentConnected(false);
        setConnectionStage('idle');
      });

      setupTextStreams(room);
      setupProductsStream(room);
      setupImagesStream(room); // ✅ اضافه کردن هندلر جدید
      setupAnswersStream(room);
      setupUserSpeechTranscription(room);
      setupCleanProductsStream(room);
      
      if (isVideoModeEnabled) {
        setupVideoHandler(room);
      }

      await room.connect(details.serverUrl, details.participantToken);
      setConnectionStage('waiting_agent'); 

      setupAgentSpeakingHandler(room);
      setIsConnected(true);
      setIsMicMuted(true);

    } catch (err) {
      console.error("❌ Connection failed:", err);
      setConnectionStage('failed');
      setIsConnected(false);
      setIsAgentConnected(false);
      roomRef.current = null;
    } finally {
      initInProgressRef.current = false;
    }
  }, [
    setupTextStreams, 
    setupProductsStream, 
    setupImagesStream, // ✅
    setupAnswersStream, 
    setupCleanProductsStream,
    setupUserSpeechTranscription, 
    setupAgentSpeakingHandler,
    setupVideoHandler,
    isVideoModeEnabled
  ]);

  const disconnectRoom = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (agentVideoRef.current) {
      agentVideoRef.current.srcObject = null;
    }
    setIsAgentVideoEnabled(false);
    currentAgentSessionRef.current = null;
    setIsConnected(false);
    setIsAgentConnected(false);
    setIsAgentSpeaking(false);
    setConnectionStage('idle');
    setMessages([]);
    setProducts([]);
    setGeneratedImages([]); // ✅ ریست کردن
    setQuickReplies([]);
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!roomRef.current || !isConnected) return;
    setQuickReplies([]);
    try {
      const payload = JSON.stringify({ role: "user", message: text });
      const info = await roomRef.current.localParticipant.sendText(payload, { topic: "lk.chat" });
      setMessages((prev) => [
        ...prev,
        { sender: "user", text, timestamp: Date.now(), streamId: info.id },
      ]);
    } catch (err) {
      // console.error("❌ Failed to send message:", err);
    }
  }, [isConnected]);

  const setMicrophoneEnabled = useCallback(async (enabled: boolean) => {
    if (!roomRef.current) return;
    if (enabled) {
      if (stopMicTimerRef.current) {
        clearTimeout(stopMicTimerRef.current);
        stopMicTimerRef.current = null;
        console.log("🎤 Mic release cancelled - keeping mic open");
        return;
      }
      if (!roomRef.current.localParticipant.isMicrophoneEnabled) {
        try {
          await roomRef.current.localParticipant.setMicrophoneEnabled(true);
          setIsMicMuted(false);
        } catch (error) {
          console.error("Failed to enable microphone:", error);
        }
      }
    } else {
      if (stopMicTimerRef.current) clearTimeout(stopMicTimerRef.current);
      stopMicTimerRef.current = setTimeout(async () => {
        if (roomRef.current) {
          try {
            await roomRef.current.localParticipant.setMicrophoneEnabled(false);
            setIsMicMuted(true);
            stopMicTimerRef.current = null;
            console.log("🛑 Microphone disabled after delay");
          } catch (error) {
            console.error("Failed to disable microphone:", error);
          }
        }
      }, 600);
    }
  }, []);

  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current) return;
    const newState = !isMicMuted; 
    await setMicrophoneEnabled(newState);
  }, [isMicMuted, setMicrophoneEnabled]);

  const toggleAgentMute = useCallback(() => {
    if (!audioRef.current) return;
    const newState = !isAgentMuted;
    audioRef.current.muted = newState;
    setIsAgentMuted(newState);
  }, [isAgentMuted]);

const sendLanguageChange = useCallback(async (languageCode: string) => {
  // ۱. بررسی‌های اولیه برای جلوگیری از خطا
  if (!roomRef.current || !isConnected) {
    console.warn("⚠️ Cannot send language: Room not connected.");
    return;
  }
  
  try {
    // ۲. آماده‌سازی پیلود به صورت استاندارد JSON
    const payload = JSON.stringify({ 
      language: languageCode,
    });

    // ۳. تبدیل رشته به Uint8Array (استاندارد حرفه‌ای LiveKit)
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    
    // ۴. ارسال داده با تنظیمات Reliable (تضمین رسیدن داده)
    await roomRef.current.localParticipant.publishData(data, { 
      topic: "language",
      reliable: true // بسیار مهم برای تنظیمات: جلوگیری از گم شدن پکت
    });
    
    console.log(`✅ Language sent to LiveKit: ${languageCode}`);
  } catch (err) {
    console.error("❌ Failed to send language:", err);
  }
}, [isConnected]); // وا
  useEffect(() => {
    return () => {
      disconnectRoom().catch(console.error);
    };
  }, [disconnectRoom]);

  return {
    messages,
    products,
    generatedImages, // ✅ خروجی جدید
    quickReplies,
    isConnected,
    isAgentConnected,
    isMicMuted,
    isAgentMuted,
    isAgentTyping,
    isAgentSpeaking,
    isAgentActive: isAgentSpeaking || isAgentTyping,
    agentVideoElement: isVideoModeEnabled ? agentVideoRef.current : null,
    isAgentVideoEnabled: isVideoModeEnabled ? isAgentVideoEnabled : false,
    isVideoModeEnabled, 
    initializeConnection,
    disconnectRoom,
    sendTextMessage,
    toggleMicrophone,
    setMicrophoneEnabled,
    toggleAgentMute,
    sendLanguageChange,  
    setProducts,
     setGeneratedImages,
    connectionStage,
  };
}
