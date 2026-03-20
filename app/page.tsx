"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useRef, useMemo } from "react";
import Header from "@/components/Header";
import MoveCounter from "@/components/MoveCounter";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import EvalSidebar, { Evaluation } from "@/components/EvalSidebar";
import ProctorOverlay from "@/components/ProctorOverlay";
import AccessGate from "@/components/AccessGate";
import { MAX_MOVES } from "@/lib/constants";
import { INITIAL_MESSAGE } from "@/lib/system-prompt";

export default function Home() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [input, setInput] = useState("");
  const [key, setKey] = useState(0);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [pasteToast, setPasteToast] = useState(false);
  const pasteToastTimer = useRef<NodeJS.Timeout | null>(null);

  const sessionTokenRef = useRef(sessionToken);
  sessionTokenRef.current = sessionToken;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async () => ({
          "x-session-code": sessionTokenRef.current || "",
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: `chat-${key}`,
    transport,
    messages: [
      {
        id: "greeting",
        role: "assistant" as const,
        parts: [{ type: "text" as const, text: INITIAL_MESSAGE }],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";
  const gameOver = moves >= MAX_MOVES;

  const displayMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(""),
  }));

  const buildContext = useCallback(() => {
    return displayMessages
      .map((m) => `${m.role === "user" ? "PM" : "Analyst"}: ${m.content}`)
      .join("\n");
  }, [displayMessages]);

  const evaluateMessage = useCallback(
    async (userMessage: string, moveNumber: number) => {
      setEvaluations((prev) => [
        ...prev,
        { moveNumber, userMessage, score: null, feedback: "", aiWarning: false, loading: true },
      ]);

      try {
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-code": sessionToken || "",
          },
          body: JSON.stringify({ userMessage, conversationContext: buildContext() }),
        });
        const data = await res.json();

        setEvaluations((prev) =>
          prev.map((ev) =>
            ev.moveNumber === moveNumber
              ? { ...ev, score: data.score, feedback: data.feedback, aiWarning: data.aiGenerated, loading: false }
              : ev
          )
        );
      } catch {
        setEvaluations((prev) =>
          prev.map((ev) =>
            ev.moveNumber === moveNumber
              ? { ...ev, score: null, feedback: "Evaluation failed", aiWarning: false, loading: false }
              : ev
          )
        );
      }
    },
    [buildContext, sessionToken]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading || gameOver) return;
      const newMove = moves + 1;
      setMoves(newMove);
      const userText = input;
      sendMessage({ text: input });
      setInput("");
      evaluateMessage(userText, newMove);
    },
    [input, isLoading, gameOver, moves, sendMessage, evaluateMessage]
  );

  const onReset = useCallback(() => {
    setSessionToken(null);
    setMoves(0);
    setInput("");
    setEvaluations([]);
    setMessages([
      { id: "greeting", role: "assistant", parts: [{ type: "text", text: INITIAL_MESSAGE }] },
    ]);
    setKey((prev) => prev + 1);
  }, [setMessages]);

  const onTabSwitch = useCallback(() => {
    setTabSwitches((prev) => prev + 1);
  }, []);

  const onPasteAttempt = useCallback(() => {
    setPasteAttempts((prev) => prev + 1);
    setPasteToast(true);
    if (pasteToastTimer.current) clearTimeout(pasteToastTimer.current);
    pasteToastTimer.current = setTimeout(() => setPasteToast(false), 2500);
  }, []);

  if (!sessionToken) {
    return <AccessGate onAuthenticated={(token) => setSessionToken(token)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <ProctorOverlay onTabSwitch={onTabSwitch} />
      <Header onReset={onReset} />
      <MoveCounter moves={moves} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <ChatWindow messages={displayMessages} isLoading={isLoading} />
          <ChatInput
            input={input}
            onChange={setInput}
            onSubmit={onSubmit}
            disabled={isLoading || gameOver}
            gameOver={gameOver}
            onPasteAttempt={onPasteAttempt}
          />
        </div>
        <EvalSidebar evaluations={evaluations} tabSwitches={tabSwitches} pasteAttempts={pasteAttempts} />
      </div>

      {pasteToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg shadow-lg animate-fade-in">
          Paste is disabled — please type your answer
        </div>
      )}
    </div>
  );
}
