"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Save,
  Loader2,
  Clock,
  Link2,
  Mail,
  Calendar,
  LogOut,
  Shield,
  AlertTriangle,
  Info,
  ChevronDown,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserSettings {
  email: string;
  default_expiry_hours: number | null;
  link_limit: number;
  created_at: string;
}

// Expiry preset options
const EXPIRY_PRESETS = [
  { label: "No expiry", value: "" },
  { label: "1 hour", value: "1" },
  { label: "24 hours (1 day)", value: "24" },
  { label: "72 hours (3 days)", value: "72" },
  { label: "168 hours (1 week)", value: "168" },
  { label: "720 hours (30 days)", value: "720" },
  { label: "Custom…", value: "custom" },
];

export default function SettingsPage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Form state
  const [expiryPreset, setExpiryPreset] = useState<string>("");
  const [customExpiryHours, setCustomExpiryHours] = useState<string>("");
  const [linkLimit, setLinkLimit] = useState<string>("500");

  // Computed effective expiry value
  const effectiveExpiryHours =
    expiryPreset === "custom"
      ? customExpiryHours
      : expiryPreset;

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setLinkLimit(data.data.link_limit?.toString() || "500");

        // Map existing value to preset
        const hours = data.data.default_expiry_hours?.toString() || "";
        const matchedPreset = EXPIRY_PRESETS.find(
          (p) => p.value === hours && p.value !== "custom"
        );
        if (!hours) {
          setExpiryPreset("");
        } else if (matchedPreset) {
          setExpiryPreset(matchedPreset.value);
        } else {
          setExpiryPreset("custom");
          setCustomExpiryHours(hours);
        }
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, number | null> = {};

      const expiryNum = effectiveExpiryHours
        ? parseInt(effectiveExpiryHours, 10)
        : null;
      if (
        expiryNum !== null &&
        (isNaN(expiryNum) || expiryNum < 1 || expiryNum > 8760)
      ) {
        toast.error("Expiry must be between 1 and 8,760 hours (365 days)");
        setSaving(false);
        return;
      }
      payload.default_expiry_hours = expiryNum;

      const limitNum = parseInt(linkLimit, 10);
      if (isNaN(limitNum) || limitNum < 10 || limitNum > 10000) {
        toast.error("Link limit must be between 10 and 10,000");
        setSaving(false);
        return;
      }
      payload.link_limit = limitNum;

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        toast.success("Settings saved");
      } else {
        toast.error(data.error?.message || "Failed to save settings");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
        <div className="w-32 h-8 skeleton-shimmer rounded" />
        <div className="max-w-[660px] space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] bg-surface border border-border rounded-card skeleton-shimmer"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#FDF3E7] flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-sans font-medium text-[22px] text-text-primary">
              Settings
            </h1>
            <p className="text-sm text-text-secondary">
              Manage your preferences and account
            </p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-destructive hover:bg-red-50 border border-border hover:border-[#F0CECE] rounded-btn transition-all"
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Sign out
        </button>
      </div>

      <div className="max-w-[660px] space-y-5">
        {/* ── Account Information ─────────────────────── */}
        <section className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-[#FDFAF5]">
            <h2 className="font-sans font-medium text-[14px] text-text-primary">
              Account information
            </h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                Email address
              </div>
              <div className="h-[40px] px-3 bg-[#F5EFE6] border border-border rounded-btn flex items-center text-sm text-text-tertiary font-medium cursor-not-allowed select-none">
                {settings?.email || "—"}
              </div>
            </div>
            {user?.fullName && (
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Shield className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  Full name
                </div>
                <div className="h-[40px] px-3 bg-[#F5EFE6] border border-border rounded-btn flex items-center text-sm text-text-tertiary font-medium cursor-not-allowed select-none">
                  {user.fullName}
                </div>
              </div>
            )}
            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                Member since
              </div>
              <div className="text-sm text-text-primary font-medium">
                {settings?.created_at
                  ? new Date(settings.created_at).toLocaleDateString(
                      undefined,
                      { month: "long", day: "numeric", year: "numeric" }
                    )
                  : "—"}
              </div>
            </div>
            <p className="text-[12px] text-text-tertiary flex items-start gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              To change your name, email, or profile photo, visit the{" "}
              <a
                href="/dashboard/account"
                className="underline hover:text-primary transition-colors"
              >
                Account page
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Link Defaults ───────────────────────────── */}
        <form onSubmit={handleSave}>
          <section className="bg-surface border border-border rounded-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-[#FDFAF5]">
              <h2 className="font-sans font-medium text-[14px] text-text-primary">
                Link defaults
              </h2>
              <p className="text-[12px] text-text-secondary mt-0.5">
                Applied automatically when creating new links
              </p>
            </div>
            <div className="px-6 py-5 space-y-6">
              {/* Default Expiry */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="expiryPreset"
                  className="flex items-center gap-2 font-sans font-medium text-[13px] text-text-primary"
                >
                  <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                  Default link expiry
                </label>

                <div className="relative max-w-[340px]">
                  <select
                    id="expiryPreset"
                    value={expiryPreset}
                    onChange={(e) => {
                      setExpiryPreset(e.target.value);
                      if (e.target.value !== "custom") {
                        setCustomExpiryHours("");
                      }
                    }}
                    className="w-full h-[44px] pl-3 pr-9 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary appearance-none cursor-pointer transition-all"
                  >
                    {EXPIRY_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                </div>

                {expiryPreset === "custom" && (
                  <div className="flex items-center gap-2 max-w-[340px]">
                    <input
                      id="customExpiry"
                      type="number"
                      min={1}
                      max={8760}
                      value={customExpiryHours}
                      onChange={(e) => setCustomExpiryHours(e.target.value)}
                      placeholder="e.g. 48"
                      className="flex-1 h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all"
                    />
                    <span className="text-sm text-text-secondary whitespace-nowrap">
                      hours
                    </span>
                  </div>
                )}

                <p className="text-[12px] text-text-tertiary pl-5">
                  New links will automatically expire after this duration.
                  {effectiveExpiryHours
                    ? ` Currently: ${effectiveExpiryHours}h (${(
                        Number(effectiveExpiryHours) / 24
                      ).toFixed(1)} days)`
                    : " Links won't expire by default."}
                </p>
              </div>

              {/* Link Limit */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="linkLimit"
                  className="flex items-center gap-2 font-sans font-medium text-[13px] text-text-primary"
                >
                  <Link2 className="w-3.5 h-3.5 text-text-tertiary" />
                  Maximum link limit
                </label>
                <div className="flex items-center gap-3 max-w-[340px]">
                  <input
                    id="linkLimit"
                    type="number"
                    min={10}
                    max={10000}
                    step={10}
                    value={linkLimit}
                    onChange={(e) => setLinkLimit(e.target.value)}
                    className="w-[120px] h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary transition-all"
                  />
                  <span className="text-sm text-text-secondary">links maximum</span>
                </div>
                <p className="text-[12px] text-text-tertiary pl-5">
                  Allowed range: 10 – 10,000 links.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-[#FDFAF5] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-btn transition-colors text-sm min-w-[130px] justify-center"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save changes
              </button>
            </div>
          </section>
        </form>

        {/* ── Danger Zone ─────────────────────────────── */}
        <section className="bg-surface border border-[#F0CECE] rounded-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F0CECE] bg-red-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="font-sans font-medium text-[14px] text-destructive">
                Danger zone
              </h2>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Delete account
                </p>
                <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                  Permanently removes your account, all links, clicks, and
                  analytics. This cannot be undone.
                </p>
              </div>
              <a
                href="/dashboard/account"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-destructive bg-red-50 hover:bg-red-100 border border-[#F0CECE] rounded-btn transition-colors whitespace-nowrap"
              >
                Manage account
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
