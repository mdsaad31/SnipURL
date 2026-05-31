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

    // Check if SVG format is requested via query param (e.g. ?format=svg)
    const format = req.nextUrl.searchParams.get("format") || "png";

    if (format === "svg") {
      const svg = await QRCode.toString(url, {
        type: "svg",
        color: {
          dark: "#1A1410",
          light: "#00000000",
        },
        margin: 1,
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
          dark: "#1A1410",
          light: "#FDFAF5",
        },
        margin: 2,
        width: 300,
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
