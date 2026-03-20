"use client";

export interface Evaluation {
  moveNumber: number;
  userMessage: string;
  score: number | null;
  feedback: string;
  aiWarning: boolean;
  loading: boolean;
}

interface EvalSidebarProps {
  evaluations: Evaluation[];
  tabSwitches: number;
  pasteAttempts: number;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  let color = "bg-green-500/20 text-green-400";
  if (score <= 3) color = "bg-red-500/20 text-red-400";
  else if (score <= 6) color = "bg-yellow-500/20 text-yellow-400";

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}/10
    </span>
  );
}

export default function EvalSidebar({
  evaluations,
  tabSwitches,
  pasteAttempts,
}: EvalSidebarProps) {
  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-900/50 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-300">Live Evaluation</h2>
        <div className="flex gap-3 mt-2">
          <div className={`flex items-center gap-1.5 text-xs ${tabSwitches > 0 ? "text-red-400" : "text-zinc-500"}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tabSwitches} tab switch{tabSwitches !== 1 ? "es" : ""}
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${pasteAttempts > 0 ? "text-red-400" : "text-zinc-500"}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {pasteAttempts} paste block{pasteAttempts !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {evaluations.length === 0 && (
          <p className="text-xs text-zinc-600 text-center mt-8">
            Evaluations will appear here as you ask questions.
          </p>
        )}

        {evaluations.map((ev) => (
          <div
            key={ev.moveNumber}
            className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-500">
                Move {ev.moveNumber}
              </span>
              {ev.loading ? (
                <span className="text-xs text-zinc-500 animate-pulse">
                  Evaluating...
                </span>
              ) : (
                <ScoreBadge score={ev.score} />
              )}
            </div>

            <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
              &ldquo;{ev.userMessage}&rdquo;
            </p>

            {!ev.loading && (
              <>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {ev.feedback}
                </p>

                {ev.aiWarning && (
                  <div className="mt-2 flex items-start gap-1.5 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-md">
                    <svg
                      className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs text-amber-400">
                      This response appears to be AI-generated
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
