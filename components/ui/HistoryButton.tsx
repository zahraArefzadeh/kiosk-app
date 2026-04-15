// components/widget/ui/HistoryButton.tsx
"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "agent";
  timestamp: number;
  streamId?: string;
}

interface ChatHistoryProps {
  messages: Message[];
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages List Container */}
      <section className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-800/50 backdrop-blur-sm 
                            flex items-center justify-center border border-slate-700/30">
                <MessageSquare 
                  size={32} 
                  className="text-slate-600" 
                  strokeWidth={1.5}
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-slate-700/20 blur-2xl" />
            </div>
         
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <article
                key={message.streamId || `${message.timestamp}-${index}`}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[85%] group">
                  <div
                    className={`rounded-2xl px-4 py-2.5 backdrop-blur-sm text-sm leading-relaxed
                      ${message.sender === "user"
                        ? "bg-white/[0.03] border border-white/5 text-slate-300" // همان استایل جدید مینیمال
                        : "bg-slate-800/50 border border-slate-700/30 text-slate-100"
                      }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                  
                  {/* Time */}
                  <div className={`mt-1 px-1 flex items-center gap-1.5
                    ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <time className="text-[10px] text-slate-600 font-medium">
                      {formatTime(message.timestamp)}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
