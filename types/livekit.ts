// ElevenLabs Integration Types

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export interface ElevenLabsConfig {
  agentId: string;
  enableElevenLabs: boolean;
  textOnly: boolean;
  connectionType: 'websocket' | 'webrtc';
  permissionCheckComplete: boolean;
}

export interface ConversationState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  messages: ChatMessage[];
  isAgentTyping: boolean;
  isConnected: boolean;
  connectionError?: string;
  conversationId?: string;
}

export interface ElevenLabsCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: string) => void;
}

export type ConversationMode = 'idle' | 'listening' | 'speaking' | 'thinking' | 'error';