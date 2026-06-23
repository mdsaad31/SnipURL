"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart2, Globe, Monitor, Smartphone, Tablet, TrendingUp, Lock,
  ExternalLink, Laptop, AppWindow,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────
interface LinkInfo {
  short_code: string;
  title: string | null;
  original_url: string;
  is_active: boolean;
  created_at: string;
  clicks_count: number;
}

interface SharedData {
  link: LinkInfo;
  sharedFields: string[];
  totalClicks?: number;
  timeSeries?: { date: string; count: number }[];
  countries?: { country: string | null; count: number }[];
  devices?: { device_type: string | null; count: number }[];
  browsers?: { browser: string | null; count: number }[];
  referrers?: { referrer: string | null; count: number }[];
  os?: { os: string | null; count: number }[];
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", JP: "Japan", IN: "India", BR: "Brazil",
  NL: "Netherlands", SG: "Singapore", PK: "Pakistan", AE: "UAE",
  TR: "Turkey", ID: "Indonesia", PH: "Philippines", MY: "Malaysia",
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4 text-text-tertiary" />,
  tablet: <Tablet className="w-4 h-4 text-text-tertiary" />,
  desktop: <Monitor className="w-4 h-4 text-text-tertiary" />,
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  catch { return d; }
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1410] border border-[#3D352C] rounded-[10px] px-3 py-2 shadow-xl">
      <p className="text-white/60 text-[11px] mb-0.5">{label}</p>
      <p className="text-white font-medium text-sm">{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function SharedAnalyticsPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";
  const domain = appUrl.replace("https://", "").replace("http://", "");

  useEffect(() => {
    if (!code) return;
    fetch(`/api/analytics/public/${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setError(d.error);
      })
      .catch(() => setError({ code: "NETWORK", message: "Network error. Please try again." }))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="w-full border-b border-border px-6 py-4">
          <div className="max-w-[900px] mx-auto flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={22} height={22} />
            <Link href="/" className="font-medium text-text-primary text-sm">Snip</Link>
          </div>
        </nav>
        <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-10 flex flex-col gap-6">
          <div className="w-48 h-6 skeleton-shimmer rounded" />
          <div className="w-full h-[140px] skeleton-shimmer rounded-card" />
          <div className="w-full h-[280px] skeleton-shimmer rounded-card" />
        </main>
      </div>
    );
  }

  if (error || !data) {
    const isPrivate = error?.code === "PRIVATE";
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="w-full border-b border-border px-6 py-4">
          <div className="max-w-[900px] mx-auto flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={22} height={22} />
            <Link href="/" className="font-medium text-text-primary text-sm">Snip</Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center px-4 py-20 text-center">
          <div>
            <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mx-auto mb-5">
              {isPrivate ? <Lock className="w-7 h-7 text-primary" /> : <BarChart2 className="w-7 h-7 text-text-tertiary" />}
            </div>
            <h1 className="font-serif text-2xl text-text-primary mb-3">
              {isPrivate ? "Analytics are private" : "Not found"}
            </h1>
            <p className="text-text-secondary text-sm mb-6 max-w-[360px] mx-auto">
              {error?.message || "This link's analytics are not publicly available."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn text-sm transition-colors"
            >
              Back to Snip
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { link, sharedFields, totalClicks = 0, timeSeries = [], countries = [], devices = [], browsers = [], referrers = [], os = [] } = data;
  const shortUrl = `${appUrl}/${link.short_code}`;

  const getBarWidth = (count: number) =>
    totalClicks > 0 ? `${(Number(count) / totalClicks) * 100}%` : "0%";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={22} height={22} />
            <Link href="/" className="font-medium text-text-primary text-sm">Snip</Link>
            <span className="text-text-tertiary text-sm mx-1">/</span>
            <span className="font-mono text-sm text-primary">{link.short_code}</span>
            <span className="text-text-tertiary text-sm mx-1">/</span>
            <span className="text-sm text-text-secondary flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              Analytics
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

      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Link Header */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary truncate mb-1 flex items-center gap-1.5">
                <span className="shrink-0">→</span>
                <span className="truncate">{link.original_url}</span>
                <a href={link.original_url} target="_blank" rel="noreferrer" className="shrink-0">
                  <ExternalLink className="w-3.5 h-3.5 text-text-tertiary hover:text-primary" />
                </a>
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[18px] font-medium text-primary hover:underline"
                >
                  {domain}/{link.short_code}
                </a>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${
                  link.is_active
                    ? "bg-[#E6F4EE] text-[#2D6A5B] border-[#B2D9C5]"
                    : "bg-[#F5EFE6] text-text-tertiary border-border"
                }`}>
                  {link.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {link.title && <p className="text-xs text-text-tertiary mt-1">{link.title}</p>}
            </div>
            {sharedFields.includes("clicks") && (
              <div className="text-right shrink-0">
                <p className="text-xs text-text-tertiary uppercase tracking-wider mb-0.5">Total Clicks</p>
                <p className="text-3xl font-sans font-semibold text-text-primary">{totalClicks.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Click Trend */}
        {sharedFields.includes("trend") && timeSeries.length > 0 && (
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-sans font-medium text-[15px] text-text-primary">Click trend</h2>
              <span className="text-xs text-text-tertiary ml-auto">last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeSeries.map((d) => ({ ...d, date: formatDate(String(d.date)) }))}>
                <defs>
                  <linearGradient id="sharedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9873A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C9873A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DF" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#A8998C" }} tickLine={false} axisLine={false} width={35} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#C9873A" strokeWidth={2} fill="url(#sharedGrad)" dot={false} activeDot={{ r: 4, fill: "#C9873A" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Countries */}
          {sharedFields.includes("countries") && (
            <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
              <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Countries
              </h3>
              <div className="flex flex-col gap-3">
                {countries.length > 0 ? countries.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary truncate max-w-[120px]">
                      {c.country ? (COUNTRY_NAMES[c.country.toUpperCase()] || c.country) : "Unknown"}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-medium">{Number(c.count)}</span>
                      <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: getBarWidth(Number(c.count)) }} />
                      </div>
                    </div>
                  </div>
                )) : <span className="text-sm text-text-tertiary">No data</span>}
              </div>
            </div>
          )}

          {/* Devices */}
          {sharedFields.includes("devices") && (
            <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
              <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">Devices</h3>
              <div className="flex flex-col gap-3">
                {devices.length > 0 ? devices.map((d, i) => {
                  const type = (d.device_type || "unknown").toLowerCase();
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {DEVICE_ICONS[type] || <Monitor className="w-4 h-4 text-text-tertiary" />}
                        <span className="text-text-primary capitalize">{d.device_type || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-medium">{Number(d.count)}</span>
                        <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: getBarWidth(Number(d.count)) }} />
                        </div>
                      </div>
                    </div>
                  );
                }) : <span className="text-sm text-text-tertiary">No data</span>}
              </div>
            </div>
          )}

          {/* Referrers */}
          {sharedFields.includes("referrers") && (
            <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
              <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">Referrers</h3>
              <div className="flex flex-col gap-3">
                {referrers.length > 0 ? referrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary truncate max-w-[120px]">{r.referrer || "Direct"}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-medium">{Number(r.count)}</span>
                      <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: getBarWidth(Number(r.count)) }} />
                      </div>
                    </div>
                  </div>
                )) : <span className="text-sm text-text-tertiary">No data</span>}
              </div>
            </div>
          )}

          {/* Browsers */}
          {sharedFields.includes("browsers") && (
            <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
              <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-primary" />
                Browsers
              </h3>
              <div className="flex flex-col gap-3">
                {browsers.length > 0 ? browsers.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary capitalize">{b.browser || "Unknown"}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-medium">{Number(b.count)}</span>
                      <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A66B22] rounded-full" style={{ width: getBarWidth(Number(b.count)) }} />
                      </div>
                    </div>
                  </div>
                )) : <span className="text-sm text-text-tertiary">No data</span>}
              </div>
            </div>
          )}

          {/* OS */}
          {sharedFields.includes("os") && (
            <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
              <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-primary" />
                Operating Systems
              </h3>
              <div className="flex flex-col gap-3">
                {os.length > 0 ? os.map((o, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-text-primary capitalize">{o.os || "Unknown"}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-medium">{Number(o.count)}</span>
                      <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2D6A5B] rounded-full" style={{ width: getBarWidth(Number(o.count)) }} />
                      </div>
                    </div>
                  </div>
                )) : <span className="text-sm text-text-tertiary">No data</span>}
              </div>
            </div>
          )}
        </div>

        {/* Powered by footer */}
        <div className="flex items-center justify-center gap-3 py-4">
          <span className="text-sm text-text-tertiary">Analytics powered by</span>
          <Link href="/" className="flex items-center gap-1.5 text-primary font-medium text-sm hover:underline">
            <Image src="/logo.png" alt="Snip" width={16} height={16} />
            Snip
          </Link>
          <span className="text-text-tertiary text-sm">·</span>
          <Link href="/sign-up" className="text-sm text-primary font-medium hover:underline">
            Create your own →
          </Link>
        </div>
      </main>
    </div>
  );
}
