"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Download, Share2, Check, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface ShortenResult {
  short_code: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: object) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      remove: (widgetId: string) => void;
    };
  }
}

export function UrlShortenerForm() {
  const { isSignedIn } = useAuth();
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>("");

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "";

  // ── Load Turnstile script for anonymous users ────────────────────
  useEffect(() => {
    if (isSignedIn || !siteKey) return;

    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "normal",
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
        });
      }
    };

    // Render when ready
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        renderWidget();
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = "";
      }
    };
  }, [isSignedIn, siteKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Require Turnstile for anonymous users
    if (!isSignedIn && !turnstileToken) {
      setError("Please complete the security challenge before shortening.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body: Record<string, string> = { url };
      if (customAlias && isSignedIn) body.customAlias = customAlias;
      if (!isSignedIn && turnstileToken) body.turnstileToken = turnstileToken;

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ short_code: data.data.short_code });
        toast.success("Link shortened successfully!");
        // Reset Turnstile for next use
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setTurnstileToken("");
        }
      } else {
        const msg = data.error?.message || "Something went wrong";
        setError(msg);
        toast.error(msg);
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setTurnstileToken("");
        }
      }
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = result ? `${appUrl}/${result.short_code}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Snip Short Link", url: shortUrl });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* URL Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full relative flex items-center mb-3 group"
      >
        <div className="absolute inset-0 bg-primary/0 group-focus-within:bg-primary/5 rounded-[12px] -m-1 transition-colors pointer-events-none" />
        <input
          type="url"
          required
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder="Paste your long URL here..."
          className="w-full h-[52px] pl-6 pr-[140px] rounded-[12px] border border-border focus:border-primary outline-none bg-surface text-base transition-colors z-10"
        />
        <button
          type="submit"
          disabled={loading || !url || (!isSignedIn && !turnstileToken)}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-primary hover:bg-primary-hover disabled:opacity-70 text-white font-medium rounded-btn transition-colors z-20 flex items-center justify-center min-w-[120px]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Shorten it →"
          )}
        </button>
      </form>

      {/* Custom Alias Field */}
      <div className="flex items-center mb-4">
        <div className="h-[40px] flex items-center px-3 bg-[#F5EFE6] border-y border-l border-border rounded-l-btn text-text-tertiary font-mono text-sm select-none">
          {domain}/
        </div>
        {isSignedIn ? (
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
            placeholder="custom-alias"
            className="h-[40px] px-3 flex-1 bg-white border border-border rounded-r-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none font-mono text-primary text-sm placeholder:text-text-tertiary transition-all"
          />
        ) : (
          <div className="h-[40px] px-3 flex-1 bg-[#F9F6F1] border border-border rounded-r-btn flex items-center gap-2 text-sm text-text-tertiary cursor-not-allowed">
            <Lock className="w-3.5 h-3.5" />
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary-hover font-medium underline underline-offset-2"
            >
              Sign in to customize
            </Link>
          </div>
        )}
      </div>

      {/* Cloudflare Turnstile — anonymous users only */}
      {!isSignedIn && siteKey && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Complete the security check to shorten links</span>
          </div>
          <div ref={turnstileRef} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-destructive text-sm font-medium mb-4">{error}</p>
      )}

      <p className="text-[13px] text-text-tertiary text-center">
        Free links never expire · Custom aliases · QR codes
      </p>

      {/* Success Result */}
      {result && (
        <div className="mt-8 w-full bg-surface border border-border rounded-card p-4 shadow-card flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
          <span className="font-mono text-primary text-lg truncate px-2">
            {domain}/{result.short_code}
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2.5 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 text-secondary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={`/api/qr/${result.short_code}`}
              download
              className="p-2.5 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
              title="Download QR"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={handleShare}
              className="p-2.5 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
