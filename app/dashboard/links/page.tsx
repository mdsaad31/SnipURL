"use client";

import { useState, Suspense } from "react";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLinks, useDeleteLink, useToggleLink } from "../_hooks/use-links";
import { LinkCard } from "../_components/link-card";
import { EmptyState } from "../_components/empty-state";

function LinksContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { links, loading, mutate } = useLinks();
  const { deleteLink } = useDeleteLink(mutate);
  const { toggleLink } = useToggleLink();
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = async (id: string, currentActive: boolean) => {
    const result = await toggleLink(id, currentActive);
    if (result) {
      mutate();
    }
  };

  const createUrl = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "true");
    return `${pathname}?${params.toString()}`;
  })();

  const filteredLinks = links.filter((link) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (link.title?.toLowerCase().includes(q) ?? false) ||
      link.original_url.toLowerCase().includes(q) ||
      link.short_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-sans font-medium text-[22px] text-text-primary">
          My links
        </h1>
        <Link
          href={createUrl}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New link
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search links..."
          className="w-full h-[40px] pl-10 pr-4 bg-surface border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all"
        />
      </div>

      {/* Link List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[72px] bg-surface border border-border rounded-card p-4 skeleton-shimmer"
            />
          ))
        ) : filteredLinks.length > 0 ? (
          filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onDelete={deleteLink}
              onToggle={handleToggle}
            />
          ))
        ) : links.length > 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-16 px-4 text-center bg-surface border border-border rounded-card shadow-sm">
            <p className="text-text-secondary text-sm">
              No links matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 pb-10">
          <div className="w-32 h-8 skeleton-shimmer rounded" />
          <div className="w-[400px] h-[40px] skeleton-shimmer rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[72px] skeleton-shimmer rounded-card"
            />
          ))}
        </div>
      }
    >
      <LinksContent />
    </Suspense>
  );
}
