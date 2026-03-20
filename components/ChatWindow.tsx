"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}
      {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex justify-start mb-4">
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 mr-2 mt-1 shrink-0">
            DA
          </div>
          <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
