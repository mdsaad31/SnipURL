"use client";

import { Link2, MousePointer2, ToggleRight, TrendingUp } from "lucide-react";
import type { LinkData } from "../_hooks/use-links";

interface StatsCardsProps {
  links: LinkData[];
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}

function StatCard({ label, value, icon, loading }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sans text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
          {label}
        </h3>
        <div className="text-text-tertiary">{icon}</div>
      </div>
      <div className="flex items-end gap-3">
        {loading ? (
          <div className="w-16 h-8 skeleton-shimmer rounded" />
        ) : (
          <span className="font-sans font-medium text-[28px] text-text-primary leading-none">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export function StatsCards({ links, loading }: StatsCardsProps) {
  const totalLinks = links.length;
  const totalClicks = links.reduce((acc, link) => acc + link.clicks_count, 0);
  const activeLinks = links.filter((l) => l.is_active).length;
  const avgClicks =
    totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Links"
        value={totalLinks.toLocaleString()}
        icon={<Link2 className="w-4 h-4" />}
        loading={loading}
      />
      <StatCard
        label="Total Clicks"
        value={totalClicks.toLocaleString()}
        icon={<MousePointer2 className="w-4 h-4" />}
        loading={loading}
      />
      <StatCard
        label="Active Links"
        value={activeLinks.toLocaleString()}
        icon={<ToggleRight className="w-4 h-4" />}
        loading={loading}
      />
      <StatCard
        label="Avg. Clicks/Link"
        value={avgClicks}
        icon={<TrendingUp className="w-4 h-4" />}
        loading={loading}
      />
    </div>
  );
}
