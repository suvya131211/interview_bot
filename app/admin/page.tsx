"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setGeneratedCode("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Invalid admin password");
        return;
      }

      const data = await res.json();
      setGeneratedCode(data.code);
    } catch {
      setError("Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white text-xl mx-auto mb-4">
            S
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Generate access codes for interview candidates
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <label className="block text-sm text-zinc-400 mb-2">
            Admin Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Enter admin password"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
            onClick={handleGenerate}
            disabled={!password || loading}
            className="w-full py-2.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? "Generating..." : "Generate Access Code"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
          )}

          {generatedCode && (
            <div className="mt-5 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-500 mb-2">
                Access Code (valid for 2 hours)
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-green-400 break-all font-mono bg-zinc-900 px-3 py-2 rounded">
                  {showToken
                    ? generatedCode
                    : generatedCode.slice(0, 8) + "••••••••••••"}
                </code>
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="shrink-0 px-3 py-2 rounded bg-zinc-700 text-zinc-300 text-xs hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  {showToken ? "Hide" : "Show"}
                </button>
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-3 py-2 rounded bg-zinc-700 text-zinc-300 text-xs hover:bg-zinc-600 transition-colors cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-2">
                Share this code with the candidate. It expires after 2 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
