"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Key,
  Plus,
  Loader2,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_revoked: boolean;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Create key modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyExpiry, setKeyExpiry] = useState<"never" | "30d" | "90d" | "1y">("never");

  // One-time key display
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke confirmation
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim(), expires_in: keyExpiry }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKey(data.data.key);
        setShowCreateModal(false);
        setKeyName("");
        setKeyExpiry("never");
        fetchKeys();
      } else {
        toast.error(data.error?.message || "Failed to create key");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("API key revoked");
        fetchKeys();
      } else {
        toast.error(data.error?.message || "Failed to revoke key");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
        <div className="w-32 h-8 skeleton-shimmer rounded" />
        <div className="max-w-[780px] space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[80px] bg-surface border border-border rounded-card skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const activeKeys = keys.filter((k) => !k.is_revoked);
  const revokedKeys = keys.filter((k) => k.is_revoked);

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#FDF3E7] flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-sans font-medium text-[22px] text-text-primary">API Keys</h1>
            <p className="text-sm text-text-secondary">
              Manage API keys for programmatic access
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* Info banner */}
      <div className="max-w-[780px] bg-[#FDF3E7] border border-primary/20 rounded-card px-5 py-4">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-medium text-text-primary mb-1">API Authentication</p>
            <p>
              Use your API key as a Bearer token in the <code className="bg-white px-1.5 py-0.5 rounded text-xs border border-border">Authorization</code> header:
            </p>
            <code className="block mt-2 bg-white px-3 py-2 rounded border border-border text-xs text-text-primary">
              Authorization: Bearer snip_live_...
            </code>
            <p className="mt-2">
              Rate limits: <strong>60 requests/min</strong>, <strong>1,000 requests/hr</strong> per key.
              All endpoints are under <code className="bg-white px-1 py-0.5 rounded text-xs border border-border">/api/v1/</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[780px] space-y-4">
        {/* Active Keys */}
        {activeKeys.length === 0 && revokedKeys.length === 0 && (
          <div className="bg-surface border border-border rounded-card px-6 py-12 text-center">
            <Key className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No API keys yet.</p>
            <p className="text-text-tertiary text-xs mt-1">Create one to start using the API.</p>
          </div>
        )}

        {activeKeys.map((key) => (
          <div key={key.id} className="bg-surface border border-border rounded-card px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-text-primary truncate">{key.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                  Active
                </span>
                {key.expires_at && new Date(key.expires_at) < new Date() && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    Expired
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-text-tertiary">
                <code className="bg-background px-2 py-0.5 rounded border border-border">{key.key_prefix}...</code>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Created {new Date(key.created_at).toLocaleDateString()}
                </span>
                {key.last_used_at && (
                  <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {confirmRevoke === key.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoking === key.id}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-destructive hover:bg-destructive/90 rounded-btn transition-colors"
                  >
                    {revoking === key.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmRevoke(null)}
                    className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary border border-border rounded-btn transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRevoke(key.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-destructive hover:bg-red-50 border border-border hover:border-red-200 rounded-btn transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Revoked Keys */}
        {revokedKeys.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3">Revoked Keys</p>
            {revokedKeys.map((key) => (
              <div key={key.id} className="bg-surface border border-border rounded-card px-5 py-4 opacity-60 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-text-primary truncate">{key.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                    Revoked
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-text-tertiary">
                  <code className="bg-background px-2 py-0.5 rounded border border-border">{key.key_prefix}...</code>
                  <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-card shadow-xl w-full max-w-[440px] mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-sans font-medium text-[16px] text-text-primary">Create API Key</h2>
              <p className="text-xs text-text-secondary mt-0.5">The key will only be shown once after creation.</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="keyName" className="text-sm font-medium text-text-primary">Key name</label>
                  <input
                    id="keyName"
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Production API, CI/CD Pipeline"
                    maxLength={100}
                    className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="keyExpiry" className="text-sm font-medium text-text-primary">Expiration</label>
                  <select
                    id="keyExpiry"
                    value={keyExpiry}
                    onChange={(e) => setKeyExpiry(e.target.value as typeof keyExpiry)}
                    className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary appearance-none cursor-pointer transition-all"
                  >
                    <option value="never">Never expires</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="1y">1 year</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border bg-[#FDFAF5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setKeyName(""); }}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border rounded-btn transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !keyName.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-btn transition-colors text-sm"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-time Key Display Modal */}
      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-card shadow-xl w-full max-w-[520px] mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-sans font-medium text-[16px] text-text-primary">Your API Key</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-btn px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Copy this key now. It will not be shown again. If you lose it, you will need to create a new one.
                </p>
              </div>
              <div className="relative">
                <code className="block w-full px-4 py-3 bg-background border border-border rounded-btn text-xs text-text-primary font-mono break-all select-all">
                  {newKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="absolute top-2 right-2 p-1.5 bg-white border border-border rounded hover:bg-background transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-text-tertiary" />}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border bg-[#FDFAF5] flex justify-end">
              <button
                onClick={() => { setNewKey(null); setCopied(false); }}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
