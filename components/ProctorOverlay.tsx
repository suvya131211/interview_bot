"use client";

import { useEffect, useState, useCallback } from "react";

interface ProctorOverlayProps {
  onTabSwitch: () => void;
}

export default function ProctorOverlay({ onTabSwitch }: ProctorOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [switchCount, setSwitchCount] = useState(0);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setSwitchCount((prev) => prev + 1);
      setVisible(true);
      onTabSwitch();
    }
  }, [onTabSwitch]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleBlur = () => {
      setSwitchCount((prev) => prev + 1);
      setVisible(true);
      onTabSwitch();
    };
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleVisibilityChange, onTabSwitch]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-zinc-900 border border-red-500/50 rounded-2xl p-8 max-w-md mx-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-red-400"
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
        </div>
        <h2 className="text-lg font-semibold text-red-400 mb-2">
          Tab Switch Detected
        </h2>
        <p className="text-sm text-zinc-400 mb-1">
          You navigated away from the interview tab.
        </p>
        <p className="text-xs text-zinc-500 mb-6">
          Total tab switches: <span className="text-red-400 font-medium">{switchCount}</span>
        </p>
        <button
          onClick={() => setVisible(false)}
          className="px-6 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
        >
          Return to Interview
        </button>
      </div>
    </div>
  );
}
