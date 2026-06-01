"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ClickChart } from "../../_components/click-chart";

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

interface StatsData {
  link: LinkInfo;
  totalClicks: number;
  timeSeries: TimeSeriesEntry[];
  referrers: ReferrerEntry[];
  countries: CountryEntry[];
  devices: DeviceEntry[];
}

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

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats/${id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error?.message || "Failed to load analytics");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStats();
  }, [id]);

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";

  if (loading) {
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

  const { link, totalClicks, timeSeries, referrers, countries, devices } = data;
  const shortUrl = `${appUrl}/${link.short_code}`;

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
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
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

      {/* Chart */}
      <ClickChart timeSeries={timeSeries} loading={false} />

      {/* 3 Columns: Referrers, Countries, Devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
