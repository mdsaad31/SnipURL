"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Loader2, Clock, Link2, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  email: string;
  default_expiry_hours: number | null;
  link_limit: number;
  created_at: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [defaultExpiryHours, setDefaultExpiryHours] = useState<string>("");
  const [linkLimit, setLinkLimit] = useState<string>("500");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setDefaultExpiryHours(
          data.data.default_expiry_hours?.toString() || ""
        );
        setLinkLimit(data.data.link_limit?.toString() || "500");
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

      const expiryNum = defaultExpiryHours
        ? parseInt(defaultExpiryHours, 10)
        : null;
      if (expiryNum !== null && (isNaN(expiryNum) || expiryNum < 1 || expiryNum > 8760)) {
        toast.error("Expiry must be between 1 and 8760 hours (365 days)");
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
        toast.success("Settings saved successfully");
      } else {
        toast.error(data.error?.message || "Failed to save settings");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
        <div className="w-32 h-8 skeleton-shimmer rounded" />
        <div className="max-w-[640px] space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[100px] bg-surface border border-border rounded-card skeleton-shimmer"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-[#FDF3E7] flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-sans font-medium text-[22px] text-text-primary">
            Settings
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your account preferences
          </p>
        </div>
      </div>

      <div className="max-w-[640px] space-y-6">
        {/* Account Info Card */}
        <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
          <h2 className="font-sans font-medium text-base text-text-primary mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-text-tertiary shrink-0" />
              <span className="text-text-secondary">Email:</span>
              <span className="text-text-primary font-medium">
                {settings?.email}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
              <span className="text-text-secondary">Member since:</span>
              <span className="text-text-primary font-medium">
                {settings?.created_at
                  ? new Date(settings.created_at).toLocaleDateString(
                      undefined,
                      { month: "long", day: "numeric", year: "numeric" }
                    )
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <form onSubmit={handleSave}>
          <div className="bg-surface border border-border rounded-card p-6 shadow-sm space-y-6">
            <h2 className="font-sans font-medium text-base text-text-primary">
              Link Defaults
            </h2>

            {/* Default Expiry */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-tertiary" />
                <label
                  htmlFor="defaultExpiry"
                  className="font-sans font-medium text-[13px] text-text-primary"
                >
                  Default link expiry (hours)
                </label>
              </div>
              <input
                id="defaultExpiry"
                type="number"
                min={1}
                max={8760}
                value={defaultExpiryHours}
                onChange={(e) => setDefaultExpiryHours(e.target.value)}
                placeholder="No expiry (leave empty)"
                className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all max-w-[300px]"
              />
              <p className="text-[12px] text-text-tertiary pl-6">
                New links will expire after this many hours. Leave empty for no expiry.
              </p>
            </div>

            {/* Link Limit */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-text-tertiary" />
                <label
                  htmlFor="linkLimit"
                  className="font-sans font-medium text-[13px] text-text-primary"
                >
                  Maximum link limit
                </label>
              </div>
              <input
                id="linkLimit"
                type="number"
                min={10}
                max={10000}
                value={linkLimit}
                onChange={(e) => setLinkLimit(e.target.value)}
                className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all max-w-[300px]"
              />
              <p className="text-[12px] text-text-tertiary pl-6">
                Maximum number of links you can create (10 – 10,000).
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-btn transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save changes
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-surface border border-[#F0CECE] rounded-card p-6 shadow-sm">
          <h2 className="font-sans font-medium text-base text-destructive mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Deleting your account will remove all your data, links, and analytics permanently.
            This action cannot be undone. To delete your account, use the Clerk account
            management portal.
          </p>
          <a
            href="https://accounts.clerk.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-destructive bg-red-50 hover:bg-red-100 border border-[#F0CECE] rounded-btn transition-colors"
          >
            Manage account
          </a>
        </div>
      </div>
    </div>
  );
}
