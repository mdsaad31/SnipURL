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
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-[8px] px-3 py-2 shadow-md">
      <p className="text-[12px] text-[#6B5E54] mb-0.5">{label}</p>
      <p className="text-[14px] font-medium text-[#C17A2E]">
        {payload[0].value} click{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function ClickChart({ timeSeries, loading }: ClickChartProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
        <div className="w-36 h-5 skeleton-shimmer rounded mb-6" />
        <div className="w-full h-[240px] skeleton-shimmer rounded" />
      </div>
    );
  }

  const chartData =
    timeSeries.length > 0
      ? timeSeries
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
