// ─── Link Types ─────────────────────────────────────────────────────

export interface LinkData {
  id: string;
  user_id: string | null;
  original_url: string;
  short_code: string;
  title: string | null;
  clicks_count: number;
  is_active: boolean;
  password_hash: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Click Types ────────────────────────────────────────────────────

export interface ClickData {
  id: string;
  link_id: string;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

// ─── API Types ──────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ─── Stats Types ────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface ReferrerData {
  referrer: string;
  count: number;
}

export interface CountryData {
  country: string;
  count: number;
}

export interface DeviceData {
  device_type: string;
  count: number;
}

export interface BrowserData {
  browser: string;
  count: number;
}

export interface LinkStats {
  link: LinkData;
  totalClicks: number;
  timeSeries: TimeSeriesPoint[];
  referrers: ReferrerData[];
  countries: CountryData[];
  devices: DeviceData[];
  browsers: BrowserData[];
}
