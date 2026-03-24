"use client";

interface HeaderProps {
  title: string;
  subtitle: string;
  brandLetter: string;
  caseLabel: string;
  isAdmin: boolean;
  onReset: () => void;
}

export default function Header({ title, subtitle, brandLetter, caseLabel, isAdmin, onReset }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-lg">
          {brandLetter}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">
            {title}
          </h1>
          <p className="text-xs text-zinc-500">
            {subtitle}
          </p>
        </div>
        <span className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          {caseLabel}
        </span>
      </div>
      {isAdmin && (
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
        >
          Reset
        </button>
      )}
    </header>
  );
}
