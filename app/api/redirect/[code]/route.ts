import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { logClick } from "../../../../lib/analytics";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getClientIp, rateLimit, rateLimitHeaders } from "../../../../lib/rate-limit";

const passwordSchema = z.object({
  password: z.string().min(1).max(128),
});

function isLinkUnavailable(link: { is_active: boolean; expires_at: Date | null }): boolean {
  return !link.is_active || (link.expires_at !== null && link.expires_at <= new Date());
}

function buildBrandedErrorPage(title: string, message: string, type: "expired" | "deactivated"): string {
  const iconColor = type === "expired" ? "#C17A2E" : "#B84040";
  const badgeColor = type === "expired" ? "#C17A2E" : "#B84040";
  const badgeBg = type === "expired" ? "#FDF3E7" : "#FFF8F8";
  const badgeLabel = type === "expired" ? "Expired" : "Deactivated";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Snip</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', -apple-system, sans-serif;
      background: #FDFAF5;
      color: #1A1410;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E8E2D9;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 460px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(26, 20, 16, 0.06);
    }
    .icon-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: ${badgeBg};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: ${badgeColor};
      background: ${badgeBg};
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 24px;
      font-weight: 400;
      color: #1A1410;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      color: #6B5E52;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: #C17A2E;
      color: #FFFFFF;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #9E6222; }
    .brand {
      margin-top: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      color: #A8998C;
    }
    .brand span { font-weight: 600; color: #C17A2E; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-circle">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" />
        <circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" />
      </svg>
    </div>
    <div class="badge">${badgeLabel}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      Go to homepage
    </a>
    <div class="brand">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C17A2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" />
        <circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" />
      </svg>
      Powered by <span>Snip</span>
    </div>
  </div>
</body>
</html>`;
}

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

  return undefined;
}

function getCityFromHeaders(req: NextRequest): string | undefined {
  const vercelCity = req.headers.get("x-vercel-ip-city");
  if (vercelCity) return decodeURIComponent(vercelCity);

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
      return new NextResponse(buildBrandedErrorPage(
        "This link has been deactivated",
        "The owner of this short link has deactivated it. It&rsquo;s no longer available for use.",
        "deactivated"
      ), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (link.expires_at && new Date() > link.expires_at) {
      return new NextResponse(buildBrandedErrorPage(
        "This link has expired",
        "This short link has passed its expiry date and is no longer active.",
        "expired"
      ), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (link.password_hash) {
      // Redirect to the password challenge page
      return NextResponse.redirect(new URL(`/${code}/challenge`, req.url));
    }

    const country = getCountryFromHeaders(req);
    const city = getCityFromHeaders(req);

    // logClick handles its own failures, so awaiting it preserves analytics
    // durability without turning a database problem into a redirect failure.
    await logClick({
      linkId: link.id,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown",
      userAgentStr: req.headers.get("user-agent") || "",
      referrer: req.headers.get("referer") || "",
      country,
      city,
    });

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
    const limit = rateLimit(`protected-link:${code}:${getClientIp(req)}`, {
      limit: 10,
      windowMs: 15 * 60_000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many password attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const parsed = passwordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const link = await db.query.links.findFirst({
      where: eq(links.short_code, code),
    });

    if (!link || !link.password_hash) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Password verification must not become a backdoor around a link owner's
    // deactivation or expiry settings.
    if (isLinkUnavailable(link)) {
      return NextResponse.json({ error: "Link is unavailable" }, { status: 410 });
    }

    const isValid = await bcrypt.compare(parsed.data.password, link.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const country = getCountryFromHeaders(req);
    const city = getCityFromHeaders(req);

    // Log before returning the URL so serverless runtimes cannot terminate the
    // work after the response has been sent.
    await logClick({
      linkId: link.id,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown",
      userAgentStr: req.headers.get("user-agent") || "",
      referrer: req.headers.get("referer") || "",
      country,
      city,
    });

    return NextResponse.json({ url: link.original_url });
  } catch (error) {
    console.error("Password auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
