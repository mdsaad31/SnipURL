"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Laptop,
  AppWindow,
  Share2,
  Check,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ClickChart } from "../../_components/click-chart";
import { AnalyticsFilter } from "../../_components/analytics-filter";

interface LinkInfo {
  id: string;
  original_url: string;
  short_code: string;
  title: string | null;
  is_active: boolean;
  clicks_count: number;
  created_at: string;
}

interface TimeSeriesEntry {
  date: string;
  count: number;
}

interface ReferrerEntry {
  referrer: string | null;
  count: number;
}

interface CountryEntry {
  country: string | null;
  count: number;
}

interface DeviceEntry {
  device_type: string | null;
  count: number;
}

interface BrowserEntry {
  browser: string | null;
  count: number;
}

interface OsEntry {
  os: string | null;
  count: number;
}

interface StatsData {
  link: LinkInfo;
  totalClicks: number;
  timeSeries: TimeSeriesEntry[];
  referrers: ReferrerEntry[];
  countries: CountryEntry[];
  devices: DeviceEntry[];
  browsers: BrowserEntry[];
  os: OsEntry[];
}

const ALL_SHARE_FIELDS = [
  { id: "clicks", label: "Total Clicks" },
  { id: "trend", label: "Click Trend" },
  { id: "countries", label: "Countries" },
  { id: "devices", label: "Devices" },
  { id: "browsers", label: "Browsers" },
  { id: "referrers", label: "Referrers" },
  { id: "os", label: "Operating Systems" },
];

// ISO 3166-1 alpha-2 → country name (common ones)
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", JP: "Japan", IN: "India", BR: "Brazil",
  NL: "Netherlands", SG: "Singapore", KR: "South Korea", IT: "Italy",
  ES: "Spain", MX: "Mexico", SE: "Sweden", NO: "Norway", DK: "Denmark",
  FI: "Finland", PL: "Poland", CH: "Switzerland", AT: "Austria",
  BE: "Belgium", IE: "Ireland", NZ: "New Zealand", PT: "Portugal",
  CZ: "Czech Republic", RO: "Romania", HU: "Hungary", TR: "Turkey",
  ZA: "South Africa", AR: "Argentina", CL: "Chile", CO: "Colombia",
  PH: "Philippines", TH: "Thailand", MY: "Malaysia", ID: "Indonesia",
  VN: "Vietnam", PK: "Pakistan", BD: "Bangladesh", EG: "Egypt",
  NG: "Nigeria", KE: "Kenya", GH: "Ghana", AE: "UAE", SA: "Saudi Arabia",
  IL: "Israel", RU: "Russia", UA: "Ukraine", CN: "China", TW: "Taiwan",
  HK: "Hong Kong",
};

function getCountryName(code: string | null): string {
  if (!code) return "Local / Dev";
  return COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase();
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="w-4 h-4 text-text-tertiary" />,
  tablet: <Tablet className="w-4 h-4 text-text-tertiary" />,
  desktop: <Monitor className="w-4 h-4 text-text-tertiary" />,
};

function getDateRangeBounds(range: string): { start: string; end: string } | null {
  if (range === "all") return null;
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[range];
  if (!days) return null;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  const start = startDate.toISOString().slice(0, 10);
  return { start, end };
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("all");

  // ── Share Analytics state ─────────────────────────────────────
  const [shareOpen, setShareOpen] = useState(false);
  const [analyticsPublic, setAnalyticsPublic] = useState(false);
  const [sharedFields, setSharedFields] = useState<string[]>(ALL_SHARE_FIELDS.map((f) => f.id));
  const [savingShare, setSavingShare] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const bounds = getDateRangeBounds(dateRange);
      let url = `/api/stats/${id}`;
      if (bounds) {
        url += `?start=${bounds.start}&end=${bounds.end}`;
      }
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        // Sync share state from link data
        const linkData = result.data.link as LinkInfo & {
          analytics_public?: boolean;
          analytics_shared_fields?: string | null;
        };
        if (linkData.analytics_public !== undefined) {
          setAnalyticsPublic(linkData.analytics_public);
        }
        if (linkData.analytics_shared_fields) {
          try {
            setSharedFields(JSON.parse(linkData.analytics_shared_fields));
          } catch { /* use default */ }
        }
      } else {
        setError(result.error?.message || "Failed to load analytics");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, dateRange]);

  useEffect(() => {
    if (id) fetchStats();
  }, [id, fetchStats]);

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";

  // ── Save share settings ───────────────────────────────────────
  const handleSaveShare = async (isPublic: boolean, fields: string[]) => {
    setSavingShare(true);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analytics_public: isPublic,
          analytics_shared_fields: JSON.stringify(fields),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(isPublic ? "Analytics are now public!" : "Analytics set to private");
      } else {
        toast.error(result.error?.message || "Failed to save settings");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingShare(false);
    }
  };

  const handleTogglePublic = async (val: boolean) => {
    setAnalyticsPublic(val);
    await handleSaveShare(val, sharedFields);
  };

  const handleFieldToggle = (fieldId: string) => {
    const next = sharedFields.includes(fieldId)
      ? sharedFields.filter((f) => f !== fieldId)
      : [...sharedFields, fieldId];
    setSharedFields(next);
  };

  const handleSaveFields = async () => {
    await handleSaveShare(analyticsPublic, sharedFields);
  };

  const handleCopyShareUrl = async () => {
    if (!data) return;
    const shareUrl = `${appUrl}/analytics/${data.link.short_code}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedShareUrl(true);
    toast.success("Share URL copied!");
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  const handleExportCSV = async () => {
    try {
      const bounds = getDateRangeBounds(dateRange);
      let url = `/api/stats/${id}?format=csv`;
      if (bounds) {
        url += `&start=${bounds.start}&end=${bounds.end}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `snip-clicks-${data?.link.short_code || id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-6 pb-10">
        <div className="w-48 h-6 skeleton-shimmer rounded" />
        <div className="w-full h-[180px] rounded-card skeleton-shimmer" />
        <div className="w-full h-[300px] rounded-card skeleton-shimmer mt-6" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-text-secondary text-sm mb-4">
          {error || "Link not found"}
        </p>
        <Link
          href="/dashboard/links"
          className="text-primary hover:text-primary-hover font-medium text-sm"
        >
          ← Back to links
        </Link>
      </div>
    );
  }

  const { link, totalClicks, timeSeries, referrers, countries, devices, browsers, os } = data;
  const shortUrl = `${appUrl}/${link.short_code}`;
  const dateBounds = getDateRangeBounds(dateRange);

  let hostname = "";
  let firstLetter = "?";
  try {
    const parsed = new URL(link.original_url);
    hostname = parsed.hostname;
    firstLetter = hostname.charAt(0).toUpperCase();
  } catch {
    hostname = link.original_url;
    firstLetter = link.original_url.charAt(0).toUpperCase() || "?";
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getBarWidth = (count: number): string => {
    if (totalClicks === 0) return "0%";
    return `${(count / totalClicks) * 100}%`;
  };

  // Find last click date from time series
  const lastClickDate =
    timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].date : null;

  return (
    <div className="flex flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-text-tertiary">
        <Link
          href="/dashboard/links"
          className="hover:text-text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          My links
        </Link>
        <span>/</span>
        <span className="text-primary font-mono">
          {domain}/{link.short_code}
        </span>
      </div>

      {/* Date Range Filter */}
      <AnalyticsFilter value={dateRange} onChange={setDateRange} />

      {/* Link Header Card */}
      <div className="bg-surface border border-border rounded-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Original URL */}
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <div className="w-5 h-5 bg-[#F5EFE6] rounded shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-text-secondary font-medium uppercase">
                  {firstLetter}
                </span>
              </div>
              <span className="truncate">{link.original_url}</span>
              <a
                href={link.original_url}
                target="_blank"
                rel="noreferrer"
                className="text-text-tertiary hover:text-primary transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Short URL */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[18px] font-medium text-primary truncate">
                {domain}/{link.short_code}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-btn transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Created & Last Click dates */}
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-text-tertiary">
                Created on {formatDate(link.created_at)}
              </span>
              {lastClickDate && (
                <>
                  <span className="text-xs text-text-tertiary">·</span>
                  <span className="text-xs text-text-tertiary">
                    Last click {formatDate(String(lastClickDate))}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-btn hover:text-primary hover:border-primary/50 transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                link.is_active
                  ? "bg-[#E6F4EE] text-[#2D6A5B] border-[#B2D9C5]"
                  : "bg-[#F5EFE6] text-text-tertiary border-border"
              }`}
            >
              {link.is_active ? "Active" : "Inactive"}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
                Total Clicks
              </span>
              <span className="text-lg font-sans font-medium text-text-primary">
                {totalClicks.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Analytics Panel */}
      <div className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
        <button
          onClick={() => setShareOpen(!shareOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F9F6F2] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#FDF3E7] flex items-center justify-center">
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-[14px] text-text-primary">Share Analytics</p>
              <p className="text-xs text-text-secondary">
                {analyticsPublic ? "Public — " + `${appUrl}/analytics/${data.link.short_code}` : "Private — share with anyone"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${analyticsPublic ? "bg-[#E6F4EE] text-[#2D6A5B]" : "bg-[#F5EFE6] text-text-tertiary"}`}>
              {analyticsPublic ? "Public" : "Private"}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${shareOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {shareOpen && (
          <div className="px-5 pb-5 border-t border-border">
            {/* Toggle public/private */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                {analyticsPublic ? <Unlock className="w-4 h-4 text-[#2D6A5B]" /> : <Lock className="w-4 h-4 text-text-tertiary" />}
                <span className="text-sm font-medium text-text-primary">
                  {analyticsPublic ? "Analytics are public" : "Analytics are private"}
                </span>
              </div>
              <button
                onClick={() => handleTogglePublic(!analyticsPublic)}
                disabled={savingShare}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                  analyticsPublic ? "bg-secondary" : "bg-[#D3C9BE]"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  analyticsPublic ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {analyticsPublic && (
              <>
                {/* Field toggles */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Visible sections</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_SHARE_FIELDS.map(({ id: fid, label }) => {
                      const active = sharedFields.includes(fid);
                      return (
                        <button
                          key={fid}
                          onClick={() => handleFieldToggle(fid)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border text-sm transition-all ${
                            active
                              ? "bg-[#FDF3E7] border-primary/40 text-primary"
                              : "bg-white border-border text-text-tertiary hover:border-border/60"
                          }`}
                        >
                          {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save fields + Copy URL */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveFields}
                    disabled={savingShare}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn text-sm transition-colors disabled:opacity-60"
                  >
                    {savingShare ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save settings
                  </button>
                  <button
                    onClick={handleCopyShareUrl}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border hover:border-primary text-text-secondary hover:text-primary rounded-btn text-sm transition-all font-medium"
                  >
                    {copiedShareUrl ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedShareUrl ? "Copied!" : "Copy share URL"}
                  </button>
                  <a
                    href={`${appUrl}/analytics/${data.link.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border hover:border-primary text-text-secondary hover:text-primary rounded-btn text-sm transition-all font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <ClickChart
        timeSeries={timeSeries}
        loading={false}
        dateRange={dateBounds ? { start: dateBounds.start, end: dateBounds.end } : undefined}
      />

      {/* Analytics Grid: Referrers, Countries, Devices, OS, Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Referrers */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">
            Top referrers
          </h3>
          <div className="flex flex-col gap-3">
            {referrers.length > 0 ? (
              referrers.map((ref, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-text-tertiary shrink-0" />
                    <span className="text-text-primary truncate max-w-[120px]">
                      {ref.referrer || "Direct"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium">{ref.count}</span>
                    <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: getBarWidth(ref.count) }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-text-tertiary">No data</span>
            )}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">
            Top countries
          </h3>
          <div className="flex flex-col gap-3">
            {countries.length > 0 ? (
              countries.map((country, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-primary truncate max-w-[120px]">
                    {getCountryName(country.country)}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium">{country.count}</span>
                    <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: getBarWidth(country.count) }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-text-tertiary">No data</span>
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">
            Devices
          </h3>
          <div className="flex flex-col gap-3">
            {devices.length > 0 ? (
              devices.map((device, i) => {
                const deviceType = (
                  device.device_type || "unknown"
                ).toLowerCase();
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {DEVICE_ICONS[deviceType] || (
                        <Monitor className="w-4 h-4 text-text-tertiary" />
                      )}
                      <span className="text-text-primary capitalize">
                        {device.device_type || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-medium">{device.count}</span>
                      <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: getBarWidth(device.count) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="text-sm text-text-tertiary">No data</span>
            )}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">
            Browsers
          </h3>
          <div className="flex flex-col gap-3">
            {browsers && browsers.length > 0 ? (
              browsers.map((browser, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AppWindow className="w-4 h-4 text-text-tertiary shrink-0" />
                    <span className="text-text-primary truncate max-w-[120px] capitalize">
                      {browser.browser || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium">{browser.count}</span>
                    <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: getBarWidth(browser.count) }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-text-tertiary">No data</span>
            )}
          </div>
        </div>

        {/* OS Breakdown */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
          <h3 className="font-sans font-medium text-[15px] text-text-primary mb-4">
            Operating systems
          </h3>
          <div className="flex flex-col gap-3">
            {os && os.length > 0 ? (
              os.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Laptop className="w-4 h-4 text-text-tertiary shrink-0" />
                    <span className="text-text-primary truncate max-w-[120px] capitalize">
                      {entry.os || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium">{entry.count}</span>
                    <div className="w-16 h-1.5 bg-[#FDF3E7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: getBarWidth(entry.count) }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-text-tertiary">No data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
