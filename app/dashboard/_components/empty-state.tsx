"use client";

import { Suspense } from "react";
import { Link as LinkIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

function EmptyStateContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createUrl = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "true");
    return `${pathname}?${params.toString()}`;
  })();

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-border rounded-card shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#F5EFE6] flex items-center justify-center mb-6">
        <LinkIcon className="w-8 h-8 text-[#D3C9BE]" strokeWidth={1.5} />
      </div>

      <h3 className="font-sans font-medium text-lg text-text-primary mb-2">
        No links yet
      </h3>
      <p className="text-text-secondary text-sm mb-8 max-w-[280px]">
        Shorten your first URL and start tracking clicks and performance.
      </p>

      <Link
        href={createUrl}
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors"
      >
        Create your first link
      </Link>
    </div>
  );
}

export function EmptyState() {
  return (
    <Suspense fallback={null}>
      <EmptyStateContent />
    </Suspense>
  );
}
