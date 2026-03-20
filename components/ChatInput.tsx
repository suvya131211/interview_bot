"use client";

import { FormEvent, KeyboardEvent, ClipboardEvent } from "react";

interface ChatInputProps {
  input: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled: boolean;
  gameOver: boolean;
  onPasteAttempt?: () => void;
}

export default function ChatInput({
  input,
  onChange,
  onSubmit,
  disabled,
  gameOver,
  onPasteAttempt,
}: ChatInputProps) {
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    onPasteAttempt?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && input.trim()) {
        onSubmit(e as unknown as FormEvent);
      }
    }
  };

  if (gameOver) {
    return (
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950">
        <div className="text-center py-3 px-4 bg-zinc-800/50 rounded-xl">
          <p className="text-sm text-zinc-400">
            Session complete — you&apos;ve used all 15 moves.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Click <span className="text-zinc-300">Reset</span> to start over.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="px-6 py-4 border-t border-zinc-800 bg-zinc-950"
    >
      <div className="flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask your analyst a question..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Send
        </button>
      </div>
    </form>
  );
}
