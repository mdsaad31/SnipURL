"use client";

import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PasswordChallengePage() {
  const { code } = useParams<{ code: string }>();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/redirect/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] bg-surface border border-border rounded-[20px] p-8 shadow-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        <Lock className="w-7 h-7 text-primary mb-6" />

        <h1 className="font-serif text-[28px] text-text-primary mb-2 text-center">
          This link is protected
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center mb-8">
          Enter the password to continue to your destination.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mb-6">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`w-full h-[44px] px-4 bg-white border-[1.5px] rounded-btn focus:ring-2 outline-none text-base transition-all ${
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive/15 text-destructive"
                : "border-border focus:border-primary focus:ring-primary/15 text-text-primary"
            }`}
          />
          {error && (
            <span className="text-xs font-medium text-destructive px-1">
              {error}
            </span>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full h-[44px] bg-primary hover:bg-primary-hover disabled:opacity-70 text-white font-medium rounded-btn transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Continue →"
            )}
          </button>
        </form>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Snip
        </Link>
      </div>
    </main>
  );
}
