"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Enter admin password"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mb-4"
          />

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
                  {generatedCode}
                </code>
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
