"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Download, Copy, Check, Share2, QrCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function PublicQrContent() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";
  const domain = appUrl.replace("https://", "").replace("http://", "");
  const shortUrl = `${appUrl}/${code}`;
  const currentYear = new Date().getFullYear();

  // Read customization params from URL (set by QR customizer share link)
  const fg = searchParams.get("fg") || "1A1410";
  const bg = searchParams.get("bg") || "FFFFFF";
  const ec = searchParams.get("ec") || "M";
  const margin = searchParams.get("margin") || "2";

  // Build QR API URL with the customization params
  const qrParams = new URLSearchParams({ color: fg, bg, ecLevel: ec, margin, size: "400" });
  const qrUrl = `/api/qr/${code}?${qrParams.toString()}`;

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, [qrUrl]);

  // High-res download URL
  const buildDownloadUrl = (format: "png" | "svg") => {
    const p = new URLSearchParams({ color: fg, bg, ecLevel: ec, margin, size: "800", format });
    return `/api/qr/${code}?${p.toString()}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShareQR = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `QR Code for ${shortUrl}`, url: currentUrl });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("QR page link copied!");
    }
  };

  const handleDownload = (format: "png" | "svg") => {
    const url = buildDownloadUrl(format);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${code}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`QR code downloading as ${format.toUpperCase()}…`);
  };

  // Determine if non-default style is applied
  const isCustomized = searchParams.has("fg") || searchParams.has("bg");
  const fgHex = `#${fg}`;
  const bgHex = bg === "transparent" ? "transparent" : `#${bg}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[680px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={22} height={22} />
            <Link href="/" className="font-medium text-text-primary text-sm">Snip</Link>
            <span className="text-text-tertiary text-sm mx-1">/</span>
            <span className="font-mono text-sm text-primary">{code}</span>
            <span className="text-text-tertiary text-sm mx-1">/</span>
            <span className="text-sm text-text-secondary flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </span>
          </div>
          <Link
            href="/sign-up"
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-btn transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px]">
          {/* QR Display Card */}
          <div className="bg-surface border border-border rounded-[24px] shadow-card p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Custom style badge */}
            {isCustomized && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF3E7] border border-[#F0DFC0] rounded-full text-xs font-medium text-primary mb-5">
                <div
                  className="w-3 h-3 rounded-full border border-black/10"
                  style={{ background: fgHex }}
                />
                <span>Custom style applied</span>
              </div>
            )}

            {/* QR Image */}
            <div
              className="relative w-[240px] h-[240px] mx-auto mb-6 rounded-[16px] overflow-hidden shadow-md"
              style={{ background: bg === "transparent" ? undefined : bgHex }}
            >
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 skeleton-shimmer rounded-[16px]" />
              )}
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-tertiary gap-2">
                  <QrCode className="w-10 h-10 opacity-40" />
                  <span className="text-xs">Failed to load QR</span>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  ref={imgRef}
                  src={qrUrl}
                  alt={`QR code for ${shortUrl}`}
                  width={240}
                  height={240}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Link info */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-mono text-xl font-semibold text-primary">
                  {domain}/{code}
                </span>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-tertiary hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-text-tertiary">Scan the QR code to open this link</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload("png")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownload("svg")}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border hover:border-primary text-text-primary font-medium rounded-btn transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download SVG
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5EFE6] hover:bg-[#EDE5D8] text-text-primary font-medium rounded-btn transition-colors text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-[#2D6A5B]" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={handleShareQR}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5EFE6] hover:bg-[#EDE5D8] text-text-primary font-medium rounded-btn transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share QR page
                </button>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-text-tertiary">
            <span>QR code powered by</span>
            <Link href="/" className="flex items-center gap-1.5 text-primary font-medium hover:underline">
              <Image src="/logo.png" alt="Snip" width={14} height={14} />
              Snip
            </Link>
            <span>·</span>
            <Link href="/sign-up" className="text-primary font-medium hover:underline">
              Create yours free →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-5 border-t border-border">
        <div className="max-w-[680px] mx-auto px-4 flex items-center justify-between text-sm text-text-tertiary">
          <span>© {currentYear} Snip</span>
          <div className="flex gap-4">
            <Link href="/termsofservice" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacystatement" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PublicQrPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PublicQrContent />
    </Suspense>
  );
}
