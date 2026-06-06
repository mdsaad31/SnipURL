"use client";

import { useState, useCallback, Suspense } from "react";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useLinks,
  useDeleteLink,
  useToggleLink,
  useBulkActions,
} from "../_hooks/use-links";
import type { LinkData } from "../_hooks/use-links";
import { LinkCard } from "../_components/link-card";
import { EmptyState } from "../_components/empty-state";
import { EditLinkModal } from "../_components/edit-link-modal";
import { BulkActionBar } from "../_components/bulk-action-bar";

const MAX_SELECTION = 50;

function LinksContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { links, loading, mutate } = useLinks();
  const { deleteLink } = useDeleteLink(mutate);
  const { toggleLink } = useToggleLink();
  const { bulkDelete, bulkToggle, loading: bulkLoading } = useBulkActions(mutate);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (next.size < MAX_SELECTION) {
          next.add(id);
        }
        return next;
      });
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredLinks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(filteredLinks.slice(0, MAX_SELECTION).map((l) => l.id))
      );
    }
  }, [filteredLinks, selectedIds.size]);

  const handleBulkDelete = useCallback(async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }
    await bulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  }, [showDeleteConfirm, bulkDelete, selectedIds]);

  const handleBulkActivate = useCallback(async () => {
    await bulkToggle(Array.from(selectedIds), true);
    setSelectedIds(new Set());
  }, [bulkToggle, selectedIds]);

  const handleBulkDeactivate = useCallback(async () => {
    await bulkToggle(Array.from(selectedIds), false);
    setSelectedIds(new Set());
  }, [bulkToggle, selectedIds]);

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-sans font-medium text-[22px] text-text-primary">
          My links
        </h1>
        <div className="flex items-center gap-3">
          {filteredLinks.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-[#F5EFE6] rounded-btn transition-colors"
            >
              {selectedIds.size === filteredLinks.length
                ? "Deselect all"
                : `Select all${filteredLinks.length > MAX_SELECTION ? ` (max ${MAX_SELECTION})` : ""}`}
            </button>
          )}
          <Link
            href={createUrl}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New link
          </Link>
        </div>
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
            <div
              key={link.id}
              className="flex items-center gap-3"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleSelect(link.id)}
                className={`w-5 h-5 shrink-0 rounded border-[1.5px] transition-all duration-150 flex items-center justify-center ${
                  selectedIds.has(link.id)
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary/50 bg-surface"
                }`}
                title={selectedIds.has(link.id) ? "Deselect" : "Select"}
              >
                {selectedIds.has(link.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <LinkCard
                  link={link}
                  onDelete={deleteLink}
                  onToggle={handleToggle}
                  onEdit={setEditingLink}
                />
              </div>
            </div>
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

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
        onClear={() => setSelectedIds(new Set())}
        loading={bulkLoading}
      />

      <EditLinkModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSuccess={mutate}
      />
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
