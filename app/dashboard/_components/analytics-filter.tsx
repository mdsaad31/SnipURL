"use client";

const FILTER_OPTIONS = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
] as const;

interface AnalyticsFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function AnalyticsFilter({ value, onChange }: AnalyticsFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTER_OPTIONS.map((option) => {
        const isActive = value === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              isActive
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
