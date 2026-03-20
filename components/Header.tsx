"use client";

interface HeaderProps {
  onReset: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-lg">
          S
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">
            Swiggy PM Case Study
          </h1>
          <p className="text-xs text-zinc-500">
            Investigate the 12% order drop
          </p>
        </div>
      </div>
      <button
        onClick={onReset}
        className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
      >
        Reset
      </button>
    </header>
  );
}
