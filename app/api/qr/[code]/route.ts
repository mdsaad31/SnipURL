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

    // Parse query parameters
    const format = req.nextUrl.searchParams.get("format") || "png";

    const sizeParam = req.nextUrl.searchParams.get("size");
    const size = sizeParam
      ? Math.min(1000, Math.max(100, parseInt(sizeParam, 10) || 300))
      : 300;

    const colorParam = req.nextUrl.searchParams.get("color");
    const color =
      colorParam && /^#[0-9a-fA-F]{6}$/.test(colorParam)
        ? colorParam
        : "#1A1410";

    if (format === "svg") {
      const svg = await QRCode.toString(url, {
        type: "svg",
        color: {
          dark: color,
          light: "#00000000",
        },
        margin: 1,
        width: size,
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
          dark: color,
          light: "#FDFAF5",
        },
        margin: 2,
        width: size,
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
