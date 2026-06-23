"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart2, Globe, Smartphone, Monitor, Tablet, TrendingUp,
  Link2, MousePointer2, Zap, ArrowUpRight, Users,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────
interface Summary {
  total_links: number;
  active_links: number;
  total_clicks: number;
  links_today: number;
  clicks_today: number;
}

interface TrendEntry { date: string; count: number }
interface CountryEntry { country: string | null; count: number }
interface DeviceEntry { device_type: string | null; count: number }
interface BrowserEntry { browser: string | null; count: number }
interface ReferrerEntry { referrer: string | null; count: number }
interface OsEntry { os: string | null; count: number }

interface AnalyticsData {
  summary: Summary;
  clickTrend: TrendEntry[];
  linkGrowth: TrendEntry[];
  countries: CountryEntry[];
  referrers: ReferrerEntry[];
  devices: DeviceEntry[];
  browsers: BrowserEntry[];
  os: OsEntry[];
}

// ── Constants ────────────────────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", JP: "Japan", IN: "India", BR: "Brazil",
  NL: "Netherlands", SG: "Singapore", KR: "South Korea", IT: "Italy",
  ES: "Spain", MX: "Mexico", SE: "Sweden", PK: "Pakistan", BD: "Bangladesh",
  AE: "UAE", SA: "Saudi Arabia", TR: "Turkey", ZA: "South Africa",
  RU: "Russia", CN: "China", ID: "Indonesia", PH: "Philippines", TH: "Thailand",
  MY: "Malaysia", VN: "Vietnam", EG: "Egypt", NG: "Nigeria", GH: "Ghana",
};

const CHART_COLORS = ["#C9873A", "#A66B22", "#E6A85C", "#F5C889", "#2D6A5B", "#4A9E8A", "#6B46C1", "#9F7AEA"];
const DEVICE_COLORS: Record<string, string> = {
  desktop: "#C9873A", mobile: "#2D6A5B", tablet: "#6B46C1",
};
const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4" />,
  tablet: <Tablet className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return d; }
}
function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── Custom Tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1410] border border-[#3D352C] rounded-[10px] px-3 py-2 shadow-xl">
      <p className="text-white/60 text-[11px] mb-0.5">{label}</p>
      <p className="text-white font-medium text-sm">{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color = "primary",
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-card p-5 shadow-sm hover:border-primary/50 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${color === "green" ? "bg-[#E6F4EE]" : color === "purple" ? "bg-purple-50" : "bg-[#FDF3E7]"}`}>
          <Icon className={`w-4.5 h-4.5 ${color === "green" ? "text-[#2D6A5B]" : color === "purple" ? "text-purple-600" : "text-primary"}`} />
        </div>
        {sub && (
          <span className="text-[11px] font-medium text-[#2D6A5B] bg-[#E6F4EE] px-2 py-0.5 rounded-full flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            {sub} today
          </span>
        )}
      </div>
      <p className="text-[28px] font-sans font-semibold text-text-primary leading-none mb-1">{value}</p>
      <p className="text-[13px] text-text-secondary">{label}</p>
    </div>
  );
}

export default function PublicAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/analytics/public")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setError("Failed to load analytics");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="w-full border-b border-border px-6 py-4">
          <div className="max-w-[1100px] mx-auto flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={22} height={22} />
            <Link href="/" className="font-medium text-text-primary text-sm">Snip</Link>
          </div>
        </nav>
        <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 py-10">
          <div className="flex flex-col gap-6">
            <div className="w-64 h-8 skeleton-shimmer rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 skeleton-shimmer rounded-card" />
              ))}
            </div>
            <div className="h-72 skeleton-shimmer rounded-card" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  const { summary, clickTrend, linkGrowth, countries, referrers, devices, browsers, os } = data;
  const totalClicks = Number(summary.total_clicks) || 0;

  // Pie chart data for devices
  const devicePieData = devices.map((d) => ({
    name: d.device_type || "Unknown",
    value: Number(d.count),
    color: DEVICE_COLORS[(d.device_type || "").toLowerCase()] || "#A8998C",
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={22} height={22} />
            <Link href="/" className="font-medium text-text-primary text-sm">Snip</Link>
            <span className="text-text-tertiary text-sm mx-1">/</span>
            <span className="font-medium text-sm text-primary flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              Platform Analytics
            </span>
          </div>
          <Link
            href="/sign-up"
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-btn transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.15em] mb-2">Live Platform Data</p>
          <h1 className="font-serif text-[32px] md:text-[40px] text-text-primary leading-tight mb-3">
            Snip Analytics
          </h1>
          <p className="text-text-secondary text-base max-w-[520px]">
            Real-time insights across all links created on the platform — from every user, every device, every corner of the world.
          </p>
        </div>

        {/* ── Summary Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Link2}
            label="Total links created"
            value={formatNum(Number(summary.total_links))}
            sub={formatNum(Number(summary.links_today))}
          />
          <StatCard
            icon={MousePointer2}
            label="Total clicks tracked"
            value={formatNum(totalClicks)}
            sub={formatNum(Number(summary.clicks_today))}
            color="green"
          />
          <StatCard
            icon={Zap}
            label="Active links"
            value={formatNum(Number(summary.active_links))}
          />
          <StatCard
            icon={Users}
            label="Avg clicks per link"
            value={Number(summary.total_links) > 0
              ? (totalClicks / Number(summary.total_links)).toFixed(1)
              : "0"}
            color="purple"
          />
        </div>

        {/* ── Click Trend + Link Growth ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Click trend */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-sans font-medium text-[15px] text-text-primary">Click activity</h2>
              <span className="text-xs text-text-tertiary ml-auto">last 30 days</span>
            </div>
            {clickTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={clickTrend.map((d) => ({ ...d, date: formatDate(String(d.date)) }))}>
                  <defs>
                    <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9873A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C9873A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#C9873A" strokeWidth={2} fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, fill: "#C9873A" }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-tertiary text-sm">No click data yet</div>
            )}
          </div>

          {/* Link growth */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Link2 className="w-4 h-4 text-primary" />
              <h2 className="font-sans font-medium text-[15px] text-text-primary">Links created</h2>
              <span className="text-xs text-text-tertiary ml-auto">last 30 days</span>
            </div>
            {linkGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={linkGrowth.map((d) => ({ ...d, date: formatDate(String(d.date)) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#C9873A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-tertiary text-sm">No link data yet</div>
            )}
          </div>
        </div>

        {/* ── Breakdown Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {/* Devices (Pie) */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">Device breakdown</h3>
            {devicePieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={devicePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {devicePieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {devicePieData.map((d, i) => {
                    const pct = totalClicks > 0 ? ((d.value / totalClicks) * 100).toFixed(1) : "0";
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
                          <span className="text-text-secondary flex items-center gap-1 capitalize">
                            {DEVICE_ICONS[d.name.toLowerCase()]}
                            {d.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{d.value.toLocaleString()}</span>
                          <span className="text-xs text-text-tertiary">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-text-tertiary">No data yet</p>
            )}
          </div>

          {/* Top Countries */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Top countries
            </h3>
            <div className="flex flex-col gap-3">
              {countries.length > 0 ? countries.map((c, i) => {
                const pct = totalClicks > 0 ? (Number(c.count) / totalClicks) * 100 : 0;
                const name = c.country ? (COUNTRY_NAMES[c.country.toUpperCase()] || c.country) : "Unknown";
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-primary truncate max-w-[140px]">{name}</span>
                      <span className="font-medium shrink-0 ml-2">{Number(c.count).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5EFE6] rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-text-tertiary">No data yet</p>}
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">Top referrers</h3>
            <div className="flex flex-col gap-3">
              {referrers.length > 0 ? referrers.map((r, i) => {
                const pct = totalClicks > 0 ? (Number(r.count) / totalClicks) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-primary truncate max-w-[140px]">{r.referrer || "Direct"}</span>
                      <span className="font-medium shrink-0 ml-2">{Number(r.count).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5EFE6] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-text-tertiary">No referrer data yet</p>}
            </div>
          </div>
        </div>

        {/* ── Browsers + OS ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">Browsers</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={browsers.map((b) => ({ name: b.browser || "Other", count: Number(b.count) }))} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} axisLine={false} width={65} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {browsers.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">Operating systems</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={os.map((o) => ({ name: o.os || "Other", count: Number(o.count) }))} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} axisLine={false} width={65} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {os.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1A1410] to-[#2D2620] rounded-[20px] p-8 text-center border border-[#3D352C]">
          <p className="text-white/60 text-sm mb-2">Ready to track your own links?</p>
          <h2 className="font-serif text-[24px] text-white mb-4">Start shortening for free</h2>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
          >
            Create your account →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto py-6 border-t border-border">
        <div className="max-w-[1100px] mx-auto px-4 flex items-center justify-between text-sm text-text-tertiary">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={18} height={18} />
            <span>© {currentYear} Snip — snipurl.click</span>
          </div>
          <div className="flex gap-4">
            <Link href="/termsofservice" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacystatement" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
