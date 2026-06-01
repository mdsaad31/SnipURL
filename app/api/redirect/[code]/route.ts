import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { logClick } from "../../../../lib/analytics";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Extract country from platform-specific headers.
 * Supports: Vercel, Cloudflare, AWS CloudFront, and Next.js geo.
 */
function getCountryFromHeaders(req: NextRequest): string | undefined {
  // Vercel
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry !== "XX") return vercelCountry;

  // Cloudflare
  const cfCountry = req.headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") return cfCountry;

  // AWS CloudFront
  const awsCountry = req.headers.get("cloudfront-viewer-country");
  if (awsCountry) return awsCountry;

  // Forwarded from middleware (middleware has access to req.geo on edge)
  const geoCountry = req.headers.get("x-geo-country");
  if (geoCountry && geoCountry !== "XX") return geoCountry;

  // Next.js geo (available in some environments)
  const geo = req.geo;
  if (geo?.country && geo.country !== "XX") return geo.country;

  return undefined;
}

function getCityFromHeaders(req: NextRequest): string | undefined {
  const vercelCity = req.headers.get("x-vercel-ip-city");
  if (vercelCity) return decodeURIComponent(vercelCity);

  // Forwarded from middleware
  const geoCity = req.headers.get("x-geo-city");
  if (geoCity) return decodeURIComponent(geoCity);

  const geo = req.geo;
  if (geo?.city) return geo.city;

  return undefined;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const link = await db.query.links.findFirst({
      where: eq(links.short_code, code),
    });

    if (!link) {
      return NextResponse.redirect(new URL("/not-found", req.url));
    }

    if (!link.is_active) {
      return NextResponse.redirect(new URL("/not-found?reason=inactive", req.url));
    }

    if (link.expires_at && new Date() > link.expires_at) {
      return NextResponse.redirect(new URL("/not-found?reason=expired", req.url));
    }

    if (link.password_hash) {
      // Redirect to the password challenge page
      return NextResponse.redirect(new URL(`/${code}/challenge`, req.url));
    }

    const country = getCountryFromHeaders(req);
    const city = getCityFromHeaders(req);

    // Fire-and-forget analytics
    logClick({
      linkId: link.id,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown",
      userAgentStr: req.headers.get("user-agent") || "",
      referrer: req.headers.get("referer") || "",
      country,
      city,
    }).catch(console.error);

    // 302 temporary redirect — allows link updates/deactivation to take effect
    return NextResponse.redirect(link.original_url, 302);
  } catch (error) {
    console.error("Redirect API error:", error);
    return NextResponse.redirect(new URL("/not-found?reason=error", req.url));
  }
}

// POST handler for password-protected link authentication
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const link = await db.query.links.findFirst({
      where: eq(links.short_code, code),
    });

    if (!link || !link.password_hash) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, link.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const country = getCountryFromHeaders(req);
    const city = getCityFromHeaders(req);

    // Log click and return the original URL for client-side redirect
    logClick({
      linkId: link.id,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown",
      userAgentStr: req.headers.get("user-agent") || "",
      referrer: req.headers.get("referer") || "",
      country,
      city,
    }).catch(console.error);

    return NextResponse.json({ url: link.original_url });
  } catch (error) {
    console.error("Password auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
