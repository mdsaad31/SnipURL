import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { env } from "../../../../lib/env";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    if (!code || code.length < 3) {
      return new NextResponse("Invalid code", { status: 400 });
    }

    const url = `${env.NEXT_PUBLIC_APP_URL}/${code}`;

    // ── Query parameters ─────────────────────────────────────────────
    const sp = req.nextUrl.searchParams;
    const format = sp.get("format") || "png";

    const sizeParam = sp.get("size");
    const size = sizeParam
      ? Math.min(1000, Math.max(100, parseInt(sizeParam, 10) || 400))
      : 400;

    // Foreground (dark modules)
    const colorParam = sp.get("color");
    const fgColor =
      colorParam && /^#?[0-9a-fA-F]{6}$/.test(colorParam)
        ? colorParam.startsWith("#") ? colorParam : `#${colorParam}`
        : "#1A1410";

    // Background (light modules), default white; "transparent" → rgba(0,0,0,0)
    const bgParam = sp.get("bg");
    const transparent = bgParam === "transparent";
    const bgColor = transparent
      ? "#00000000"
      : bgParam && /^#?[0-9a-fA-F]{6}$/.test(bgParam)
      ? bgParam.startsWith("#") ? bgParam : `#${bgParam}`
      : "#FFFFFF";

    // Error correction level: L | M | Q | H
    const ecParam = sp.get("ecLevel") || sp.get("ec") || "M";
    const ecLevel = (["L", "M", "Q", "H"].includes(ecParam.toUpperCase())
      ? ecParam.toUpperCase()
      : "M") as "L" | "M" | "Q" | "H";

    // Margin / quiet zone (0–4)
    const marginParam = sp.get("margin");
    const margin = marginParam
      ? Math.min(4, Math.max(0, parseInt(marginParam, 10)))
      : 2;

    if (format === "svg") {
      const svg = await QRCode.toString(url, {
        type: "svg",
        color: {
          dark: fgColor,
          light: bgColor,
        },
        margin,
        width: size,
        errorCorrectionLevel: ecLevel,
      });

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } else {
      const buffer = await QRCode.toBuffer(url, {
        type: "png",
        color: {
          dark: fgColor,
          light: transparent ? "#00000000" : bgColor,
        },
        margin,
        width: size,
        errorCorrectionLevel: ecLevel,
      });

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch (error) {
    console.error("GET /api/qr/[code] error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
