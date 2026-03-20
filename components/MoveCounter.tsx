"use client";

import { MAX_MOVES } from "@/lib/constants";

interface MoveCounterProps {
  moves: number;
}

export default function MoveCounter({ moves }: MoveCounterProps) {
  const remaining = MAX_MOVES - moves;
  const percentage = (moves / MAX_MOVES) * 100;

  let color = "bg-green-500";
  if (remaining <= 3) color = "bg-red-500";
  else if (remaining <= 7) color = "bg-yellow-500";

  return (
    <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-400">
          Move {moves} of {MAX_MOVES}
        </span>
        <span className="text-xs text-zinc-500">
          {remaining} remaining
        </span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
