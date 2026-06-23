"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { X, XCircle, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCreateLink } from "../_hooks/use-links";

function CreateLinkModalContent({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = searchParams.has("create");

  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState("");

  const { createLink, loading } = useCreateLink();

  const domain =
    process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace(
      "http://",
      ""
    ) || "snipurl.click";

  const close = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("create");
    const qs = newParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    // Reset form
    setUrl("");
    setCustomAlias("");
    setTitle("");
    setPassword("");
    setExpiresAt("");
    setShowPassword(false);
    setShowAdvanced(false);
    setError("");
  }, [searchParams, router, pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setError("");

    const result = await createLink({
      url,
      customAlias: customAlias || undefined,
      title: title || undefined,
      password: password || undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });

    if (result) {
      close();
      onSuccess();
    } else {
      setError("Failed to create link. Please check your URL and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1410]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="bg-surface w-full max-w-[520px] rounded-[24px] shadow-lg border border-border flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <h2 className="font-sans font-medium text-xl text-text-primary">
            New link
          </h2>
          <button
            onClick={close}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form
            id="create-link"
            onSubmit={handleSubmit}
            autoComplete="off"
            className="flex flex-col gap-6"
          >
            {error && (
              <div className="p-3 bg-[#FFF8F8] border border-[#F0CECE] rounded-btn text-destructive text-sm font-medium flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Destination URL */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-primary">
                Destination URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-long-url.com/goes/here"
                className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-base text-text-primary placeholder:text-text-tertiary transition-all"
              />
            </div>

            {/* Custom Alias */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-primary">
                Short link (optional)
              </label>
              <div className="flex items-center">
                <div className="h-[44px] flex items-center px-3 bg-[#F5EFE6] border-y-[1.5px] border-l-[1.5px] border-border rounded-l-btn text-[#A8998C] font-mono text-sm select-none">
                  {domain}/
                </div>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) =>
                    setCustomAlias(
                      e.target.value.replace(/[^a-zA-Z0-9-]/g, "")
                    )
                  }
                  placeholder="custom-alias"
                  className="h-[44px] px-3 flex-1 bg-white border-[1.5px] border-border rounded-r-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none font-mono text-primary placeholder:text-text-tertiary transition-all"
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-primary">
                Link title (optional)
              </label>
              <input
                type="text"
                name="link-title"
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome link"
                className="h-[44px] px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-base text-text-primary placeholder:text-text-tertiary transition-all"
              />
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors self-start -mt-1"
            >
              Advanced options
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {/* Advanced Options Section */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="flex flex-col gap-5 pt-1">
                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-medium text-[13px] text-text-primary">
                    Password protection
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="link-password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional password protection"
                      className="h-[44px] w-full px-3 pr-10 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-base text-text-primary placeholder:text-text-tertiary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-medium text-[13px] text-text-primary">
                    Link expires on
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="h-[44px] w-full px-3 bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-text-primary placeholder:text-text-tertiary transition-all [color-scheme:light]"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border/50 flex justify-end gap-3 bg-[#FCF8F2] rounded-b-[24px]">
          <button
            type="button"
            onClick={close}
            className="px-5 py-2 text-text-secondary hover:bg-[#F5EFE6] font-medium rounded-btn transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-link"
            disabled={!url || loading}
            className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-btn transition-colors flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create link"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CreateLinkModal({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  return (
    <Suspense fallback={null}>
      <CreateLinkModalContent onSuccess={onSuccess} />
    </Suspense>
  );
}
