"use client";

import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLinks, useDeleteLink, useToggleLink } from "./_hooks/use-links";
import { StatsCards } from "./_components/stats-cards";
import { LinkCard } from "./_components/link-card";
import { EmptyState } from "./_components/empty-state";
import { EditLinkModal } from "./_components/edit-link-modal";
import type { LinkData } from "./_hooks/use-links";

function DashboardContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { links, setLinks, loading, mutate } = useLinks();
  const { deleteLink } = useDeleteLink();
  const { toggleLink } = useToggleLink();
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);

  const handleDelete = async (id: string) => {
    const prev = links;
    setLinks((cur) => cur.filter((l) => l.id !== id));
    const ok = await deleteLink(id);
    if (!ok) setLinks(prev);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setLinks((cur) =>
      cur.map((l) => (l.id === id ? { ...l, is_active: !currentActive } : l))
    );
    const result = await toggleLink(id, currentActive);
    if (!result) {
      setLinks((cur) =>
        cur.map((l) => (l.id === id ? { ...l, is_active: currentActive } : l))
      );
    }
  };

  const createUrl = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "true");
    return `${pathname}?${params.toString()}`;
  })();

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-sans font-medium text-[22px] text-text-primary">
          Dashboard
        </h1>
        <Link
          href={createUrl}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New link
        </Link>
      </div>

      {/* Stats Row */}
      <StatsCards links={links} loading={loading} />

      {/* Recent Links Section */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-medium text-base text-text-primary">
            Recent links
          </h2>
          {links.length > 5 && (
            <Link
              href="/dashboard/links"
              className="text-[13px] font-medium text-primary hover:text-primary-hover"
            >
              View all
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-[72px] bg-surface border border-border rounded-card p-4 skeleton-shimmer"
              />
            ))
          ) : links.length > 0 ? (
            links.slice(0, 5).map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onEdit={setEditingLink}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <EditLinkModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSuccess={mutate}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8 pb-10">
          <div className="w-48 h-8 skeleton-shimmer rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[100px] bg-surface border border-border rounded-card skeleton-shimmer"
              />
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
