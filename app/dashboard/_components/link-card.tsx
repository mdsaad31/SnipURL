"use client";

import { useState } from "react";
import { Copy, Check, MousePointer2, BarChart2, Trash2, Pencil, Lock, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { LinkData } from "../_hooks/use-links";

interface LinkCardProps {
  link: LinkData;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onEdit?: (link: LinkData) => void;
}

export function LinkCard({ link, onDelete, onToggle, onEdit }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"}/${link.short_code}`;

  let hostname = "";
  let firstLetter = "?";
  try {
    const parsed = new URL(link.original_url);
    hostname = parsed.hostname;
    firstLetter = hostname.charAt(0).toUpperCase();
  } catch {
    hostname = link.original_url;
    firstLetter = link.original_url.charAt(0).toUpperCase() || "?";
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showConfirm) {
      onDelete(link.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div
      className={`w-full bg-surface border rounded-card p-4 hover:border-primary transition-colors group shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${
        link.is_active ? "border-border" : "border-border opacity-60"
      }`}
    >
      {/* Left: Favicon + Title + URL */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-[#F5EFE6] rounded shrink-0 flex items-center justify-center">
          <span className="text-xs text-text-secondary font-medium uppercase">
            {firstLetter}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-sans font-medium text-[14px] text-text-primary truncate">
            {link.title || hostname}
          </span>
          <span className="font-sans text-[12px] text-text-tertiary truncate">
            {link.original_url}
          </span>
        </div>
      </div>

      {/* Middle: Short URL */}
      <div className="flex-1 shrink-0 flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="font-mono font-medium text-[14px] text-primary hover:text-primary-hover hover:underline truncate"
        >
          {domain}/{link.short_code}
        </button>
        {link.password_hash && (
          <span title="Password protected">
            <Lock className="w-3 h-3 text-primary/70 shrink-0" />
          </span>
        )}
      </div>

      {/* Right: Stats + Actions */}
      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
        {/* Stats */}
        <div className="flex items-center gap-4 text-text-secondary">
          <div className="flex items-center gap-1.5" title="Total clicks">
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="text-[12px] font-medium">
              {link.clicks_count}
            </span>
          </div>
          <div className="text-[12px] text-text-tertiary hidden md:block">
            {new Date(link.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          {link.expires_at && (
            new Date(link.expires_at) > new Date() ? (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-[#E6F4EE] text-[#2D6A5B] px-2 py-0.5 rounded-full font-medium">
                <Clock className="w-2.5 h-2.5" />
                Expires {new Date(link.expires_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-red-50 text-destructive px-2 py-0.5 rounded-full font-medium">
                <Clock className="w-2.5 h-2.5" />
                Expired
              </span>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
            title="Copy link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-secondary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(link);
              }}
              className="p-2 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
              title="Edit link"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <Link
            href={`/dashboard/analytics/${link.id}`}
            className="p-2 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
            title="Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-btn transition-colors ${
              showConfirm
                ? "text-white bg-destructive hover:bg-destructive/90"
                : "text-text-secondary hover:text-destructive hover:bg-red-50"
            }`}
            title={showConfirm ? "Click again to confirm" : "Delete link"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {/* Active/Inactive Toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(link.id, link.is_active);
            }}
            className={`ml-1 relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              link.is_active ? "bg-secondary" : "bg-[#D3C9BE]"
            }`}
            title={link.is_active ? "Deactivate" : "Activate"}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                link.is_active ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
