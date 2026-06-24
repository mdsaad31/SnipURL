import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiError } from "@/lib/api-response";
import { eq, and } from "drizzle-orm";
import QRCode from "qrcode";

export const GET = withApiAuth(async (req, { user, params }) => {
  const link = await db.query.links.findFirst({
    where: and(eq(links.short_code, params.code), eq(links.user_id, user.id)),
  });

  if (!link) {
    return apiError("NOT_FOUND", "Link not found or does not belong to you.", 404);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click";
  const url = `${appUrl}/${link.short_code}`;

  const sp = new URL(req.url).searchParams;
  const format = sp.get("format") || "png";

  const sizeParam = sp.get("size");
  const size = sizeParam
    ? Math.min(1000, Math.max(100, parseInt(sizeParam, 10) || 400))
    : 400;

  const colorParam = sp.get("color");
  const fgColor =
    colorParam && /^#?[0-9a-fA-F]{6}$/.test(colorParam)
      ? colorParam.startsWith("#") ? colorParam : `#${colorParam}`
      : "#1A1410";

  const bgParam = sp.get("bg");
  const transparent = bgParam === "transparent";
  const bgColor = transparent
    ? "#00000000"
    : bgParam && /^#?[0-9a-fA-F]{6}$/.test(bgParam)
    ? bgParam.startsWith("#") ? bgParam : `#${bgParam}`
    : "#FFFFFF";

  const ecParam = sp.get("ec") || "M";
  const ecLevel = (["L", "M", "Q", "H"].includes(ecParam.toUpperCase())
    ? ecParam.toUpperCase()
    : "M") as "L" | "M" | "Q" | "H";

  const marginParam = sp.get("margin");
  const margin = marginParam
    ? Math.min(4, Math.max(0, parseInt(marginParam, 10)))
    : 2;

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      color: { dark: fgColor, light: bgColor },
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
  }

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    color: { dark: fgColor, light: transparent ? "#00000000" : bgColor },
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
});
