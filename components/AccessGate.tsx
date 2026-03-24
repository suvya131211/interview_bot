"use client";

import { useState } from "react";
import { CASE_STUDIES } from "@/lib/case-studies";

interface AccessGateProps {
  onAuthenticated: (token: string, username: string) => void;
}

export default function AccessGate({ onAuthenticated }: AccessGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (data.valid && data.sessionToken) {
        onAuthenticated(data.sessionToken, username.trim());
      } else {
        setError(data.reason || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">
            PM
          </div>
          <h1 className="text-2xl font-semibold text-white">
            PM Case Study Interview
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Enter your credentials to begin the test
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Before you begin</h2>
          <ol className="space-y-3 text-[13px] leading-relaxed text-zinc-400 list-none m-0 p-0">
            <li className="flex items-start gap-3">
              <span className="text-orange-400 font-semibold shrink-0 w-5 text-right">1.</span>
              <span>This test has <span className="text-white font-medium">{CASE_STUDIES.length} case studies</span>. You will complete them one after another.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 font-semibold shrink-0 w-5 text-right">2.</span>
              <span>In each case, you play the <span className="text-white font-medium">Product Manager</span>. An AI analyst will respond to your questions with data.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 font-semibold shrink-0 w-5 text-right">3.</span>
              <span>You have a <span className="text-white font-medium">limited number of moves</span> per case. Use them wisely to investigate and find the root cause.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 font-semibold shrink-0 w-5 text-right">4.</span>
              <span>When ready, click <span className="text-white font-medium">&quot;Submit Final Answer&quot;</span> to record your analysis and move to the next case.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-400 font-semibold shrink-0 w-5 text-right">5.</span>
              <span><span className="text-red-400">Copy-paste is disabled</span> and <span className="text-red-400">tab switches are tracked</span>. Please work independently.</span>
            </li>
          </ol>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="block text-sm text-zinc-400 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter your username"
            autoComplete="off"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mb-4"
          />

          <label className="block text-sm text-zinc-400 mb-2">Password</label>
          <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your password"
              autoComplete="off"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!username.trim() || !password.trim() || loading}
            className="w-full py-3 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? "Signing in..." : "Start Interview"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
          )}
        </div>

        <p className="text-xs text-zinc-600 text-center mt-4">
          Don&apos;t have credentials? Contact your interviewer.
        </p>
      </div>
    </div>
  );
}
