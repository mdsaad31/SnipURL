"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimeSeriesEntry {
  date: string;
  count: number;
}

interface ClickChartProps {
  timeSeries: TimeSeriesEntry[];
  loading: boolean;
  dateRange?: { start: string; end: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function formatDateLabel(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-btn shadow-sm px-3 py-2">
      <p className="text-[12px] text-text-secondary mb-0.5">
        {label ? formatDateLabel(label) : ""}
      </p>
      <p className="text-[14px] font-medium text-primary">
        {payload[0].value} click{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function zeroFillDays(
  timeSeries: TimeSeriesEntry[],
  start: string,
  end: string
): TimeSeriesEntry[] {
  const dateMap = new Map<string, number>();
  for (const entry of timeSeries) {
    // Normalize the date key to YYYY-MM-DD
    const key = String(entry.date).slice(0, 10);
    dateMap.set(key, (dateMap.get(key) || 0) + entry.count);
  }

  const result: TimeSeriesEntry[] = [];
  const current = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");

  while (current <= endDate) {
    const key = current.toISOString().slice(0, 10);
    result.push({ date: key, count: dateMap.get(key) || 0 });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function ClickChart({ timeSeries, loading, dateRange }: ClickChartProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
        <div className="w-36 h-5 skeleton-shimmer rounded mb-6" />
        <div className="w-full h-[240px] skeleton-shimmer rounded" />
      </div>
    );
  }

  // Zero-fill missing days when a date range is provided
  const filledSeries =
    dateRange && dateRange.start && dateRange.end
      ? zeroFillDays(timeSeries, dateRange.start, dateRange.end)
      : timeSeries;

  const chartData =
    filledSeries.length > 0
      ? filledSeries
      : [{ date: "No data", count: 0 }];

  return (
    <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
      <h3 className="font-sans font-medium text-[15px] text-text-primary mb-6">
        Clicks over time
      </h3>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C17A2E" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#C17A2E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F0EAE2"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A8998C", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A8998C", fontSize: 11 }}
              dx={-10}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#C17A2E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
              activeDot={{
                r: 6,
                fill: "#C17A2E",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
