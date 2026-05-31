import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { logClick } from "../../../../lib/analytics";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

    // Fire-and-forget analytics
    logClick({
      linkId: link.id,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgentStr: req.headers.get("user-agent") || "",
      referrer: req.headers.get("referer") || "",
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

    // Log click and return the original URL for client-side redirect
    logClick({
      linkId: link.id,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgentStr: req.headers.get("user-agent") || "",
      referrer: req.headers.get("referer") || "",
    }).catch(console.error);

    return NextResponse.json({ url: link.original_url });
  } catch (error) {
    console.error("Password auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
