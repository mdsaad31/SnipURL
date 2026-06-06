"use client";

import { useState, Suspense } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useLinks } from "../_hooks/use-links";
import { QrCard } from "../_components/qr-card";

function QrCodesContent() {
  const { links, loading } = useLinks();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLinks = links.filter((link) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (link.title?.toLowerCase().includes(q) ?? false) ||
      link.short_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-sans font-medium text-[22px] text-text-primary">
          QR Codes
        </h1>
      </div>

      {/* Search */}
      <div className="relative max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search QR codes..."
          className="w-full h-[40px] pl-10 pr-4 bg-surface border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all"
        />
      </div>

      {/* QR Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-card shadow-sm flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-center p-6 pb-4">
                <div className="w-[180px] h-[180px] rounded-[12px] skeleton-shimmer" />
              </div>
              <div className="flex flex-col gap-2 px-5 pb-5">
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-8 rounded-btn skeleton-shimmer" />
                  <div className="h-8 w-24 rounded-btn skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => (
            <QrCard key={link.id} link={link} />
          ))}
        </div>
      ) : links.length > 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-border rounded-card shadow-sm">
          <p className="text-text-secondary text-sm">
            No QR codes matching &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-border rounded-card shadow-sm">
          <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-text-tertiary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" />
              <path d="M21 14h-1v3h-3v1h-1v3h3v-3h2v-1" />
            </svg>
          </div>
          <h3 className="font-sans font-medium text-[15px] text-text-primary mb-1">
            No links yet
          </h3>
          <p className="text-text-secondary text-sm mb-4 max-w-[280px]">
            Create your first link to generate QR codes.
          </p>
          <Link
            href="/dashboard?create=true"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
          >
            Create a link
          </Link>
        </div>
      )}
    </div>
  );
}

export default function QrCodesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 pb-10">
          <div className="w-32 h-8 skeleton-shimmer rounded" />
          <div className="w-[400px] h-[40px] skeleton-shimmer rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] skeleton-shimmer rounded-card"
              />
            ))}
          </div>
        </div>
      }
    >
      <QrCodesContent />
    </Suspense>
  );
}
