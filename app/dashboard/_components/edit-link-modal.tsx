"use client";

import { useState, useEffect, useCallback } from "react";
import { X, XCircle, Lock, Eye, EyeOff, CalendarX2, ShieldOff, Loader2 } from "lucide-react";
import type { LinkData } from "../_hooks/use-links";
import { useEditLink } from "../_hooks/use-links";

interface EditLinkModalProps {
  link: LinkData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditLinkModal({ link, onClose, onSuccess }: EditLinkModalProps) {
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [removePassword, setRemovePassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [clearExpiry, setClearExpiry] = useState(false);
  const [error, setError] = useState("");

  const { editLink, loading } = useEditLink(() => {
    onClose();
    onSuccess();
  });

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";

  // Pre-populate fields when link changes
  useEffect(() => {
    if (link) {
      setTitle(link.title || "");
      setPassword("");
      setShowPassword(false);
      setRemovePassword(false);
      setError("");
      setClearExpiry(false);

      if (link.expires_at) {
        // Format for datetime-local input
        const d = new Date(link.expires_at);
        const formatted = d.toISOString().slice(0, 16);
        setExpiresAt(formatted);
      } else {
        setExpiresAt("");
      }
    }
  }, [link]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && link) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [link, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!link) return;
      setError("");

      // Build payload — only include changed fields
      const payload: Record<string, string | null | boolean | undefined> = {};

      // Title
      const newTitle = title.trim() || null;
      if (newTitle !== (link.title || null)) {
        payload.title = newTitle || "";
      }

      // Password
      if (removePassword) {
        payload.password = null;
      } else if (password) {
        payload.password = password;
      }

      // Expiry
      if (clearExpiry) {
        payload.expiresAt = null;
      } else if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      }

      const result = await editLink(link.id, payload);

      if (!result) {
        setError("Failed to update link. Please try again.");
      }
    },
    [link, title, password, removePassword, expiresAt, clearExpiry, editLink]
  );

  if (!link) return null;

  const hasPassword = !!link.password_hash;
  const hasExpiry = !!link.expires_at;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1410]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface w-full max-w-[520px] rounded-[24px] shadow-lg border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <h2 className="font-sans font-medium text-xl text-text-primary">
            Edit link
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form
            id="edit-link"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {error && (
              <div className="p-3 bg-[#FFF8F8] border border-[#F0CECE] rounded-btn text-destructive text-sm font-medium flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Original URL — READ ONLY */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <label className="font-sans font-medium text-[13px] text-text-primary">
                  Destination URL
                </label>
                <div className="group relative">
                  <Lock className="w-3 h-3 text-text-tertiary" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#1A1410] text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Cannot be changed after creation
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1410]" />
                  </div>
                </div>
              </div>
              <input
                type="text"
                readOnly
                value={link.original_url}
                className="h-[44px] px-3 bg-[#F5EFE6] border-[1.5px] border-border rounded-btn text-sm text-text-tertiary font-mono cursor-not-allowed truncate"
                title={link.original_url}
              />
            </div>

            {/* Short Alias — READ ONLY */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <label className="font-sans font-medium text-[13px] text-text-primary">
                  Short link
                </label>
                <div className="group relative">
                  <Lock className="w-3 h-3 text-text-tertiary" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-[#1A1410] text-white text-[11px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Cannot be changed after creation
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1410]" />
                  </div>
                </div>
              </div>
              <input
                type="text"
                readOnly
                value={`${domain}/${link.short_code}`}
                className="h-[44px] px-3 bg-[#F5EFE6] border-[1.5px] border-border rounded-btn text-sm text-text-tertiary font-mono cursor-not-allowed"
              />
            </div>

            {/* Title — Editable */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-primary">
                Link title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome link"
                className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-base text-text-primary placeholder:text-text-tertiary transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-primary">
                Password protection
              </label>
              {removePassword ? (
                <div className="flex items-center gap-2 h-[44px] px-3 bg-[#FFF8F8] border-[1.5px] border-[#F0CECE] rounded-btn">
                  <ShieldOff className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm text-destructive font-medium flex-1">
                    Password will be removed
                  </span>
                  <button
                    type="button"
                    onClick={() => setRemovePassword(false)}
                    className="text-[12px] text-text-secondary hover:text-text-primary font-medium underline"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      hasPassword
                        ? "Password is set (leave blank to keep)"
                        : "Optional password protection"
                    }
                    className="h-[44px] w-full px-3 pr-20 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-base text-text-primary placeholder:text-text-tertiary transition-all"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-text-tertiary hover:text-text-secondary transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {hasPassword && (
                      <button
                        type="button"
                        onClick={() => {
                          setRemovePassword(true);
                          setPassword("");
                        }}
                        className="p-1.5 text-text-tertiary hover:text-destructive transition-colors"
                        title="Remove password"
                      >
                        <ShieldOff className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-primary">
                Expiry date
              </label>
              {clearExpiry ? (
                <div className="flex items-center gap-2 h-[44px] px-3 bg-[#FFF8F8] border-[1.5px] border-[#F0CECE] rounded-btn">
                  <CalendarX2 className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm text-destructive font-medium flex-1">
                    Expiry will be removed
                  </span>
                  <button
                    type="button"
                    onClick={() => setClearExpiry(false)}
                    className="text-[12px] text-text-secondary hover:text-text-primary font-medium underline"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="h-[44px] w-full px-3 pr-12 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all [color-scheme:light]"
                  />
                  {hasExpiry && (
                    <button
                      type="button"
                      onClick={() => {
                        setClearExpiry(true);
                        setExpiresAt("");
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-text-tertiary hover:text-destructive transition-colors"
                      title="Clear expiry"
                    >
                      <CalendarX2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border/50 flex justify-end gap-3 bg-[#FCF8F2] rounded-b-[24px]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-text-secondary hover:bg-[#F5EFE6] font-medium rounded-btn transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-link"
            disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-btn transition-colors flex items-center justify-center min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
