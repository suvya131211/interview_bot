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
import { CASE_STUDIES } from "@/lib/case-studies";

export default function Home() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [input, setInput] = useState("");
  const [key, setKey] = useState(0);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [pasteToast, setPasteToast] = useState(false);
  const pasteToastTimer = useRef<NodeJS.Timeout | null>(null);

  // Intro modal state
  const [showIntroModal, setShowIntroModal] = useState(true);

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [testComplete, setTestComplete] = useState(false);

  const currentCase = CASE_STUDIES[currentCaseIndex];
  const isAdmin = username.toLowerCase() === "admin";

  const sessionTokenRef = useRef(sessionToken);
  sessionTokenRef.current = sessionToken;

  const caseIndexRef = useRef(currentCaseIndex);
  caseIndexRef.current = currentCaseIndex;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async () => ({
          "x-session-code": sessionTokenRef.current || "",
          "x-case-study": String(caseIndexRef.current),
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
        parts: [{ type: "text" as const, text: currentCase.initialMessage }],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";
  const gameOver = moves >= currentCase.maxMoves;

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
          body: JSON.stringify({
            userMessage,
            conversationContext: buildContext(),
            caseStudyIndex: caseIndexRef.current,
          }),
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
    setUsername("");
    setCurrentCaseIndex(0);
    setMoves(0);
    setInput("");
    setEvaluations([]);
    setTabSwitches(0);
    setPasteAttempts(0);
    setTestComplete(false);
    setShowSubmitModal(false);
    setShowIntroModal(true);
    setFinalAnswer("");
    const firstCase = CASE_STUDIES[0];
    setMessages([
      { id: "greeting", role: "assistant", parts: [{ type: "text", text: firstCase.initialMessage }] },
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

  const handleSubmitFinalAnswer = useCallback(async () => {
    if (!finalAnswer.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-code": sessionToken || "",
        },
        body: JSON.stringify({
          username,
          caseStudyId: currentCase.id,
          caseStudyTitle: currentCase.title,
          finalAnswer: finalAnswer.trim(),
          messages: displayMessages,
          evaluations: evaluations.map((e) => ({
            moveNumber: e.moveNumber,
            score: e.score,
            feedback: e.feedback,
            aiWarning: e.aiWarning,
          })),
          tabSwitches,
          pasteAttempts,
          movesUsed: moves,
        }),
      });

      // Move to next case study or complete
      if (currentCaseIndex < CASE_STUDIES.length - 1) {
        const nextIndex = currentCaseIndex + 1;
        const nextCase = CASE_STUDIES[nextIndex];
        setCurrentCaseIndex(nextIndex);
        setMoves(0);
        setInput("");
        setEvaluations([]);
        setFinalAnswer("");
        setShowSubmitModal(false);
        setTabSwitches(0);
        setPasteAttempts(0);
        setMessages([
          { id: "greeting", role: "assistant", parts: [{ type: "text", text: nextCase.initialMessage }] },
        ]);
        setKey((prev) => prev + 1);
      } else {
        setTestComplete(true);
        setShowSubmitModal(false);
      }
    } catch {
      setSubmitError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    finalAnswer,
    sessionToken,
    username,
    currentCase,
    displayMessages,
    evaluations,
    tabSwitches,
    pasteAttempts,
    moves,
    currentCaseIndex,
    setMessages,
  ]);

  if (!sessionToken) {
    return (
      <AccessGate
        onAuthenticated={(token, user) => {
          setSessionToken(token);
          setUsername(user);
        }}
      />
    );
  }

  if (testComplete) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Test Complete
          </h1>
          <p className="text-zinc-400">
            Thank you for completing all case studies. Your responses have been recorded.
          </p>
          <p className="text-zinc-500 text-sm mt-4">
            You may close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <ProctorOverlay onTabSwitch={onTabSwitch} />
      <Header
        title={currentCase.title}
        subtitle={currentCase.subtitle}
        brandLetter={currentCase.brandLetter}
        caseLabel={`Case ${currentCaseIndex + 1} of ${CASE_STUDIES.length}`}
        isAdmin={isAdmin}
        onReset={onReset}
      />
      <MoveCounter moves={moves} maxMoves={currentCase.maxMoves} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <ChatWindow messages={displayMessages} isLoading={isLoading} />
          <ChatInput
            input={input}
            onChange={setInput}
            onSubmit={onSubmit}
            disabled={isLoading || gameOver}
            gameOver={gameOver}
            maxMoves={currentCase.maxMoves}
            onPasteAttempt={onPasteAttempt}
            onSubmitFinalAnswer={() => setShowSubmitModal(true)}
          />
        </div>
        <EvalSidebar evaluations={evaluations} tabSwitches={tabSwitches} pasteAttempts={pasteAttempts} />
      </div>

      {pasteToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg shadow-lg animate-fade-in">
          Paste is disabled — please type your answer
        </div>
      )}

      {/* Intro Modal — shown once after login */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-7 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-lg">
                PM
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Welcome, {username}</h2>
                <p className="text-xs text-zinc-500">PM Case Study Interview</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-300 mb-6">
              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">How this works</h3>
                <ul className="space-y-1.5 text-zinc-400">
                  <li>You will solve <span className="text-white">{CASE_STUDIES.length} case studies</span> back to back.</li>
                  <li>In each case, a metric has dropped. Your job is to <span className="text-white">find the root cause</span> by asking questions to a data analyst.</li>
                  <li>The analyst has the data but won&apos;t guide you — you must lead the investigation.</li>
                </ul>
              </div>

              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">Case studies</h3>
                <div className="space-y-2">
                  {CASE_STUDIES.map((cs, i) => (
                    <div key={cs.id} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                      <span className="text-zinc-300">{cs.title}</span>
                      <span className="text-zinc-600 text-xs">({cs.maxMoves} moves)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-800/60 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">Rules</h3>
                <ul className="space-y-1.5 text-zinc-400">
                  <li><span className="text-red-400">Copy-paste is disabled.</span> Type your questions manually.</li>
                  <li><span className="text-red-400">Tab switches are tracked.</span> Stay on this tab throughout.</li>
                  <li>Each question you send counts as one move. You cannot undo moves.</li>
                  <li>When you&apos;re ready, click <span className="text-green-400">&quot;Submit Final Answer&quot;</span> to record your conclusion and move to the next case.</li>
                  <li>Your entire chat, scores, and activity are logged for review.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowIntroModal(false)}
              className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
            >
              I understand — Start Case 1
            </button>
          </div>
        </div>
      )}

      {/* Submit Final Answer Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              Submit Final Answer — {currentCase.title}
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Summarize your root cause analysis and key findings.
              {currentCaseIndex < CASE_STUDIES.length - 1 && (
                <span className="block mt-1 text-zinc-500">
                  After submitting, you will proceed to the next case study.
                </span>
              )}
            </p>

            <textarea
              value={finalAnswer}
              onChange={(e) => setFinalAnswer(e.target.value)}
              placeholder="Type your final answer here..."
              rows={6}
              className="w-full resize-none rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mb-4"
            />

            {submitError && (
              <p className="text-sm text-red-400 mb-3">{submitError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitError("");
                }}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFinalAnswer}
                disabled={!finalAnswer.trim() || submitting}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
