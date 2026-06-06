"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";
import type { LinkData } from "../_hooks/use-links";

interface QrCardProps {
  link: LinkData;
  onCopy?: (shortUrl: string) => void;
}

export function QrCard({ link, onCopy }: QrCardProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"}/${link.short_code}`;

  let hostname = "";
  try {
    hostname = new URL(link.original_url).hostname;
  } catch {
    hostname = link.original_url;
  }

  const displayTitle = link.title || hostname;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      onCopy?.(shortUrl);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const downloadUrl = `/api/qr/${link.short_code}?format=png`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `qr-${link.short_code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR code downloading...");
  };

  return (
    <div className="bg-surface border border-border rounded-card shadow-sm hover:border-primary transition-all duration-200 group flex flex-col overflow-hidden">
      {/* QR Code Preview */}
      <div className="relative flex items-center justify-center p-6 pb-4">
        <div className="relative w-[180px] h-[180px] rounded-[12px] overflow-hidden bg-[#FDFAF5] flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ease-out">
          {/* Skeleton placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-shimmer rounded-[12px]" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/${link.short_code}`}
            alt={`QR code for ${displayTitle}`}
            width={180}
            height={180}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col gap-2 px-5 pb-5">
        {/* Title */}
        <h3 className="font-sans font-medium text-[14px] text-text-primary truncate">
          {displayTitle}
        </h3>

        {/* Short URL */}
        <p className="font-mono text-[12px] text-primary truncate">
          {domain}/{link.short_code}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-btn transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border hover:border-primary text-text-secondary hover:text-primary text-xs font-medium rounded-btn transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-secondary" />
                <span className="text-secondary">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
