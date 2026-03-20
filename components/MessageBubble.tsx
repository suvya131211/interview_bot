"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 mr-2 mt-1 shrink-0">
          DA
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-orange-500 text-white rounded-br-md"
            : "bg-zinc-800 text-zinc-100 rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-table:text-xs prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-table:border-zinc-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-xs font-medium text-white ml-2 mt-1 shrink-0">
          PM
        </div>
      )}
    </div>
  );
}
