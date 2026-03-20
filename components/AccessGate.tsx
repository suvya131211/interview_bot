"use client";

import { useState } from "react";

interface AccessGateProps {
  onAuthenticated: (code: string) => void;
}

export default function AccessGate({ onAuthenticated }: AccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (data.valid) {
        onAuthenticated(code.trim());
      } else {
        setError(data.reason || "Invalid access code");
      }
    } catch {
      setError("Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">
            S
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Swiggy PM Case Study
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Enter your access code to begin the interview
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="block text-sm text-zinc-400 mb-2">
            Access Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Paste your access code here"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mb-4 font-mono"
          />

          <button
            onClick={handleSubmit}
            disabled={!code.trim() || loading}
            className="w-full py-3 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? "Validating..." : "Start Interview"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
          )}
        </div>

        <p className="text-xs text-zinc-600 text-center mt-4">
          Don&apos;t have a code? Contact your interviewer.
        </p>
      </div>
    </div>
  );
}
