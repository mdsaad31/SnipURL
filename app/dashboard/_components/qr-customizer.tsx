"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X, Download, Share2, Upload, Trash2, Check,
  Palette, Settings2, QrCode, Link2, Copy, Code2,
} from "lucide-react";
import { toast } from "sonner";

interface QrCustomizerProps {
  shortCode: string;
  title?: string | null;
  onClose: () => void;
}

// ── Presets ────────────────────────────────────────────────────────
const PRESETS = [
  { id: "classic", label: "Classic", fg: "#000000", bg: "#FFFFFF" },
  { id: "brand", label: "Snip", fg: "#1A1410", bg: "#FDF3E7" },
  { id: "dark", label: "Dark", fg: "#F5EFE7", bg: "#1A1410" },
  { id: "ocean", label: "Ocean", fg: "#1E3A5F", bg: "#E8F4FD" },
  { id: "forest", label: "Forest", fg: "#1E5128", bg: "#E9F5DB" },
  { id: "berry", label: "Berry", fg: "#6B2D8B", bg: "#F5EBFF" },
  { id: "sunset", label: "Sunset", fg: "#8B1A1A", bg: "#FFF3E0" },
  { id: "slate", label: "Slate", fg: "#1A2744", bg: "#F0F4F8" },
  { id: "rose", label: "Rose", fg: "#831843", bg: "#FFF1F2" },
  { id: "amber", label: "Amber", fg: "#78350F", bg: "#FFFBEB" },
  { id: "teal", label: "Teal", fg: "#134E4A", bg: "#F0FDFA" },
  { id: "midnight", label: "Midnight", fg: "#60A5FA", bg: "#0F172A" },
];

const EC_LEVELS = [
  { value: "L", label: "L", desc: "Low (7%)" },
  { value: "M", label: "M", desc: "Medium (15%)" },
  { value: "Q", label: "Q", desc: "High (25%)" },
  { value: "H", label: "H", desc: "Max (30%)" },
];

export function QrCustomizer({ shortCode, title, onClose }: QrCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qrLibRef = useRef<typeof import("qrcode") | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";
  const targetUrl = `${appUrl}/${shortCode}`;


  // ── State ───────────────────────────────────────────────────────
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [transparent, setTransparent] = useState(false);
  const [size, setSize] = useState(400);
  const [margin, setMargin] = useState(2);
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoRatio, setLogoRatio] = useState(22); // % of QR size
  const [logoRadius, setLogoRadius] = useState(8);
  const [format, setFormat] = useState<"png" | "svg">("png");
  const [activePreset, setActivePreset] = useState("classic");
  const [rendering, setRendering] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "style" | "logo">("colors");

  // ── Load QR library ─────────────────────────────────────────────
  useEffect(() => {
    import("qrcode").then((mod) => {
      qrLibRef.current = mod;
      renderQR();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render QR ────────────────────────────────────────────────────
  const renderQR = useCallback(async () => {
    const QRCode = qrLibRef.current;
    const canvas = canvasRef.current;
    if (!QRCode || !canvas) return;

    setRendering(true);

    // When using logo, enforce H error correction
    const effectiveEc = logo ? "H" : ecLevel;

    try {
      await QRCode.toCanvas(canvas, targetUrl, {
        width: 320, // preview size
        margin,
        errorCorrectionLevel: effectiveEc,
        color: {
          dark: fgColor,
          light: transparent ? "#00000000" : bgColor,
        },
      });

      // Draw logo on top if present
      if (logo) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
          const canvasSize = canvas.width;
          const logoSize = (canvasSize * logoRatio) / 100;
          const x = (canvasSize - logoSize) / 2;
          const y = (canvasSize - logoSize) / 2;
          const pad = 6;
          const r = logoRadius;

          // White rounded background for logo
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, r);
          ctx.fillStyle = transparent ? "rgba(255,255,255,0.9)" : bgColor;
          ctx.fill();
          ctx.restore();

          // Clip logo to rounded rect
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, logoSize, logoSize, Math.max(0, r - 4));
          ctx.clip();
          ctx.drawImage(img, x, y, logoSize, logoSize);
          ctx.restore();
        };
        img.src = logo;
      }
    } catch (err) {
      console.error("QR render error:", err);
    } finally {
      setRendering(false);
    }
  }, [targetUrl, fgColor, bgColor, transparent, margin, ecLevel, logo, logoRatio, logoRadius]);

  // Re-render on any option change
  useEffect(() => {
    if (qrLibRef.current) renderQR();
  }, [renderQR]);

  // ── Preset apply ─────────────────────────────────────────────────
  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setActivePreset(preset.id);
    setFgColor(preset.fg);
    setBgColor(preset.bg);
    setTransparent(false);
  };

  // ── Logo upload ──────────────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      toast.error("Logo must be under 200 KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogo(ev.target?.result as string);
      if (ecLevel !== "H") setEcLevel("H");
    };
    reader.readAsDataURL(file);
  };

  // ── Download ─────────────────────────────────────────────────────
  const handleDownload = async () => {
    const QRCode = qrLibRef.current;
    if (!QRCode) return;

    const effectiveEc = logo ? "H" : ecLevel;

    if (format === "png") {
      // Generate high-res canvas
      const offscreen = document.createElement("canvas");
      try {
        await QRCode.toCanvas(offscreen, targetUrl, {
          width: size,
          margin,
          errorCorrectionLevel: effectiveEc,
          color: {
            dark: fgColor,
            light: transparent ? "#00000000" : bgColor,
          },
        });

        // Overlay logo on high-res canvas
        if (logo) {
          await new Promise<void>((resolve) => {
            const ctx = offscreen.getContext("2d");
            if (!ctx) { resolve(); return; }
            const img = new Image();
            img.onload = () => {
              const canvasSize = offscreen.width;
              const logoSize = (canvasSize * logoRatio) / 100;
              const x = (canvasSize - logoSize) / 2;
              const y = (canvasSize - logoSize) / 2;
              const pad = Math.round((6 / 320) * canvasSize);
              const r = logoRadius;
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, r);
              ctx.fillStyle = bgColor;
              ctx.fill();
              ctx.restore();
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x, y, logoSize, logoSize, Math.max(0, r - 4));
              ctx.clip();
              ctx.drawImage(img, x, y, logoSize, logoSize);
              ctx.restore();
              resolve();
            };
            img.onerror = () => resolve();
            img.src = logo!;
          });
        }

        const dataUrl = offscreen.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `qr-${shortCode}.png`;
        a.href = dataUrl;
        a.click();
        toast.success("PNG downloaded!");
      } catch (err) {
        console.error(err);
        toast.error("Download failed");
      }
    } else {
      // SVG — if there's a logo, embed it as base64 <image> in a composite SVG
      try {
        const QRCode = qrLibRef.current;
        if (!QRCode) return;
        const effectiveEc = logo ? "H" : ecLevel;
        const svgString = await QRCode.toString(targetUrl, {
          type: "svg",
          width: size,
          margin,
          errorCorrectionLevel: effectiveEc,
          color: {
            dark: fgColor,
            light: transparent ? "#00000000" : bgColor,
          },
        });

        let finalSvg = svgString;

        if (logo) {
          // Inject logo as a centered <image> element
          const logoSize = Math.round((size * logoRatio) / 100);
          const logoX = Math.round((size - logoSize) / 2);
          const logoY = Math.round((size - logoSize) / 2);
          const pad = Math.round((6 / 320) * size);
          const r = logoRadius;
          const bgFill = transparent ? "#FFFFFF" : bgColor;

          const logoOverlay = `
  <rect x="${logoX - pad}" y="${logoY - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="${r}" ry="${r}" fill="${bgFill}"/>
  <image href="${logo}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" clip-path="url(#logo-clip-${shortCode})"/>
  <defs><clipPath id="logo-clip-${shortCode}"><rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${Math.max(0, r - 4)}" ry="${Math.max(0, r - 4)}"/></clipPath></defs>`;

          finalSvg = svgString.replace("</svg>", `${logoOverlay}</svg>`);
        }

        const blob = new Blob([finalSvg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `qr-${shortCode}.svg`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("SVG downloaded!");
      } catch (err) {
        console.error(err);
        toast.error("SVG export failed");
      }
    }
  };

  // ── Share image via native share dialog ─────────────────────────
  const handleShareImage = async () => {
    const QRCode = qrLibRef.current;
    if (!QRCode) return;

    try {
      const effectiveEc = logo ? "H" : ecLevel;
      const offscreen = document.createElement("canvas");
      await QRCode.toCanvas(offscreen, targetUrl, {
        width: 400,
        margin,
        errorCorrectionLevel: effectiveEc,
        color: {
          dark: fgColor,
          light: transparent ? "#00000000" : bgColor,
        },
      });

      // Overlay logo if present
      if (logo) {
        await new Promise<void>((resolve) => {
          const ctx = offscreen.getContext("2d");
          if (!ctx) { resolve(); return; }
          const img = new Image();
          img.onload = () => {
            const canvasSize = offscreen.width;
            const logoSize = (canvasSize * logoRatio) / 100;
            const x = (canvasSize - logoSize) / 2;
            const y = (canvasSize - logoSize) / 2;
            const pad = Math.round((6 / 320) * canvasSize);
            const r = logoRadius;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, r);
            ctx.fillStyle = bgColor;
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, logoSize, logoSize, Math.max(0, r - 4));
            ctx.clip();
            ctx.drawImage(img, x, y, logoSize, logoSize);
            ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logo!;
        });
      }

      offscreen.toBlob(async (blob) => {
        if (!blob) { toast.error("Could not create image"); return; }
        const file = new File([blob], `qr-${shortCode}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `QR Code — ${shortCode}`,
            text: `Scan to open ${targetUrl}`,
            files: [file],
          });
        } else if (navigator.share) {
          // Fallback: share URL only
          await navigator.share({ title: `QR Code — ${shortCode}`, url: targetUrl });
        } else {
          // Last resort: trigger PNG download
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.download = `qr-${shortCode}.png`;
          a.href = url;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Saved as PNG (sharing not supported on this browser)");
        }
      }, "image/png");
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  // ── Copy embed code ──────────────────────────────────────────────
  const handleCopyEmbed = async () => {
    const effectiveEc = logo ? "H" : ecLevel;
    const params = new URLSearchParams({
      size: "400",
      color: fgColor.replace("#", ""),
      bg: transparent ? "transparent" : bgColor.replace("#", ""),
      ecLevel: effectiveEc,
      margin: String(margin),
    });
    const apiUrl = `${appUrl}/api/qr/${shortCode}?${params.toString()}`;
    const embedCode = `<img src="${apiUrl}" alt="QR Code for ${appUrl}/${shortCode}" width="400" height="400" />`;
    await navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface w-full max-w-[820px] my-auto rounded-[20px] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FDF3E7] rounded-[10px] flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                {title || "QR Customizer"}
              </h2>
              <p className="text-[12px] text-text-tertiary font-mono">{shortCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5EFE6] rounded-btn transition-colors text-text-tertiary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col lg:flex-row min-h-0">
          {/* ─── Left: Settings ─── */}
          <div className="lg:w-[340px] shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border max-h-[55vh] lg:max-h-[600px]">
            {/* Presets */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Style Presets</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-[10px] border transition-all group ${
                      activePreset === preset.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {/* Color preview dots */}
                    <div
                      className="w-8 h-8 rounded-[8px] border border-black/10 flex items-center justify-center relative overflow-hidden"
                      style={{ background: preset.bg }}
                    >
                      <div
                        className="w-4 h-4 rounded-[3px]"
                        style={{ background: preset.fg }}
                      />
                    </div>
                    <span className="text-[10px] text-text-secondary font-medium">{preset.label}</span>
                    {activePreset === preset.id && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: "colors", label: "Colors", icon: Palette },
                { id: "style", label: "Style", icon: Settings2 },
                { id: "logo", label: "Logo", icon: Upload },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-text-tertiary hover:text-text-primary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="px-5 py-4">
              {activeTab === "colors" && (
                <div className="flex flex-col gap-4">
                  {/* Foreground */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-2 block">Foreground (QR dots)</label>
                    <div className="flex items-center gap-3">
                      <label className="relative cursor-pointer">
                        <div
                          className="w-9 h-9 rounded-[10px] border-2 border-white shadow-md ring-1 ring-border"
                          style={{ background: fgColor }}
                        />
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => {
                            setFgColor(e.target.value);
                            setActivePreset("");
                          }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={fgColor.toUpperCase()}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setFgColor(v);
                          setActivePreset("");
                        }}
                        className="flex-1 h-9 px-3 font-mono text-sm bg-white border border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-text-primary"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Background */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-text-secondary">Background</label>
                      <button
                        onClick={() => { setTransparent(!transparent); setActivePreset(""); }}
                        className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                          transparent
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white border-border text-text-tertiary hover:border-primary/40"
                        }`}
                      >
                        Transparent
                      </button>
                    </div>
                    <div className={`flex items-center gap-3 ${transparent ? "opacity-40 pointer-events-none" : ""}`}>
                      <label className="relative cursor-pointer">
                        <div
                          className="w-9 h-9 rounded-[10px] border-2 border-white shadow-md ring-1 ring-border"
                          style={{ background: bgColor }}
                        />
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => { setBgColor(e.target.value); setActivePreset(""); }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={bgColor.toUpperCase()}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBgColor(v);
                          setActivePreset("");
                        }}
                        className="flex-1 h-9 px-3 font-mono text-sm bg-white border border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-text-primary"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "style" && (
                <div className="flex flex-col gap-5">
                  {/* Size */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-text-secondary">Output size</label>
                      <span className="text-xs font-mono text-primary font-medium">{size}px</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={1000}
                      step={50}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                      <span>200</span><span>1000px</span>
                    </div>
                  </div>

                  {/* Margin */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-text-secondary">Quiet zone (margin)</label>
                      <span className="text-xs font-mono text-primary font-medium">{margin}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                      <span>None</span><span>4</span>
                    </div>
                  </div>

                  {/* Error correction */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-text-secondary">Error correction</label>
                      {logo && (
                        <span className="text-[10px] text-text-tertiary bg-[#FDF3E7] px-2 py-0.5 rounded-full">
                          Locked to H (logo)
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {EC_LEVELS.map(({ value, label, desc }) => (
                        <button
                          key={value}
                          onClick={() => setEcLevel(value as "L" | "M" | "Q" | "H")}
                          disabled={!!logo}
                          title={desc}
                          className={`py-2 text-sm font-medium rounded-[8px] border transition-all ${
                            (logo ? "H" : ecLevel) === value
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-border text-text-secondary hover:border-primary/40 disabled:opacity-50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-text-tertiary mt-1.5">
                      Higher = more redundancy. H required for logo overlay.
                    </p>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-2 block">Download format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["png", "svg"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`py-2 text-sm font-medium rounded-[8px] border uppercase tracking-wider transition-all ${
                            format === f
                              ? "bg-primary border-primary text-white"
                              : "bg-white border-border text-text-secondary hover:border-primary/40"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "logo" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-text-secondary">
                    Embed your logo in the center of the QR code. Upload PNG, JPEG, or SVG (max 200 KB).
                    Error correction will be automatically set to H.
                  </p>

                  {/* Upload button */}
                  {!logo ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-border hover:border-primary/50 rounded-[12px] text-text-tertiary hover:text-primary transition-all"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">Click to upload logo</span>
                      <span className="text-xs">PNG · SVG · JPEG (max 200 KB)</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 p-3 bg-[#F5EFE6] rounded-[12px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-10 h-10 object-contain rounded-[8px] bg-white border border-border p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">Logo uploaded</p>
                          <p className="text-xs text-text-tertiary">Error correction locked to H</p>
                        </div>
                        <button
                          onClick={() => { setLogo(null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="p-1.5 hover:bg-red-50 hover:text-destructive rounded-btn transition-colors text-text-tertiary"
                          title="Remove logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Logo size */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Logo size</label>
                          <span className="text-xs font-mono text-primary">{logoRatio}%</span>
                        </div>
                        <input
                          type="range" min={10} max={35} step={1} value={logoRatio}
                          onChange={(e) => setLogoRatio(Number(e.target.value))}
                          className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                        />
                      </div>

                      {/* Logo corner radius */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-text-secondary">Corner radius</label>
                          <span className="text-xs font-mono text-primary">{logoRadius}px</span>
                        </div>
                        <input
                          type="range" min={0} max={40} step={2} value={logoRadius}
                          onChange={(e) => setLogoRadius(Number(e.target.value))}
                          className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Preview + Actions ─── */}
          <div className="flex-1 flex flex-col items-center justify-between p-6 gap-4 overflow-y-auto max-h-[55vh] lg:max-h-[600px]">
            {/* Preview */}
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative">
                <div
                  className={`rounded-[16px] overflow-hidden shadow-lg transition-all duration-200 ${
                    transparent ? "bg-[repeating-conic-gradient(#d1d5db_0%_25%,transparent_0%_50%)_0_0_/_16px_16px]" : ""
                  }`}
                  style={{ background: transparent ? undefined : bgColor }}
                >
                  <canvas
                    ref={canvasRef}
                    className={`block transition-opacity duration-200 ${rendering ? "opacity-60" : "opacity-100"}`}
                  />
                </div>
                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Short URL label */}
              <div className="flex items-center gap-2 text-text-secondary">
                <Link2 className="w-3.5 h-3.5" />
                <span className="font-mono text-sm text-primary font-medium">
                  {appUrl.replace("https://", "")}/{shortCode}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full">
              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download {format.toUpperCase()} · {size}px
              </button>

              {/* Share + Embed row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareImage}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-btn border border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary transition-all text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Image
                </button>
                <a
                  href={`/qr/${shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-btn border border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary transition-all text-sm font-medium"
                >
                  <QrCode className="w-4 h-4" />
                  Open QR Page
                </a>
              </div>

              {/* Embed code — always visible */}
              <div className="bg-[#F9F6F2] border border-border rounded-[12px] p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    Embed in website / email
                  </p>
                  <button
                    onClick={handleCopyEmbed}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1A1410] hover:bg-[#2D2620] text-white text-[11px] font-medium rounded-btn transition-colors"
                  >
                    {copiedEmbed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedEmbed ? "Copied!" : "Copy tag"}
                  </button>
                </div>
                <div className="font-mono text-[10px] text-text-tertiary bg-white border border-border px-3 py-2 rounded-btn overflow-x-auto whitespace-nowrap">
                  {`<img src="${appUrl}/api/qr/${shortCode}?color=${fgColor.replace("#","")}" />`}
                </div>
                <p className="text-[10px] text-text-tertiary mt-1.5">
                  Paste anywhere to show this QR with your current colors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
