import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { links, users } from "../../../lib/db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { urlSchema, fetchUrlTitle } from "../../../lib/url-utils";
import { createUniqueShortCode, isValidCustomAlias, isAliasAvailable } from "../../../lib/short-code";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createLinkSchema = z.object({
  url: urlSchema,
  customAlias: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  turnstileToken: z.string().optional().nullable(),
});

// ── Cloudflare Turnstile verification ────────────────────────────────
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secret) return true; // skip in dev if key not set
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const userLinks = await db.query.links.findMany({
      where: eq(links.user_id, user.id),
      orderBy: [desc(links.created_at)],
    });

    return NextResponse.json({ success: true, data: userLinks });
  } catch (error) {
    console.error("GET /api/links error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { url, customAlias, password, expiresAt, turnstileToken } = parsed.data;

    // Get user (can be null for anonymous)
    const user = await getCurrentUser();

    // ── Turnstile check for anonymous users ─────────────────────────
    if (!user) {
      const clientIp =
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";

      if (!turnstileToken) {
        return NextResponse.json(
          { success: false, error: { code: "CAPTCHA_REQUIRED", message: "Please complete the security challenge." } },
          { status: 403 }
        );
      }
      const isValid = await verifyTurnstile(turnstileToken, clientIp);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: { code: "CAPTCHA_FAILED", message: "Security challenge failed. Please try again." } },
          { status: 403 }
        );
      }
    }

    let shortCode = "";

    // Handle custom alias — requires authentication
    if (customAlias) {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Clerk auth failed. Please sign in again." } },
          { status: 401 }
        );
      }

      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "User not found in local database. Please try signing out and signing back in." } },
          { status: 401 }
        );
      }

      const aliasCheck = isValidCustomAlias(customAlias);
      if (!aliasCheck.valid) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ALIAS", message: aliasCheck.reason || "Invalid custom alias." } },
          { status: 400 }
        );
      }

      const isAvailable = await isAliasAvailable(customAlias);
      if (!isAvailable) {
        return NextResponse.json(
          { success: false, error: { code: "ALIAS_TAKEN", message: "This custom alias is already taken." } },
          { status: 409 }
        );
      }

      shortCode = customAlias;
    } else {
      shortCode = await createUniqueShortCode();
    }

    // Try to fetch title (non-blocking — falls back to URL)
    const fetchedTitle = await fetchUrlTitle(url);
    const finalTitle = parsed.data.title?.trim() || fetchedTitle || url;

    // Hash password if provided
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // ── Default expiry from user settings ───────────────────────────
    let resolvedExpiresAt: Date | null = expiresAt ? new Date(expiresAt) : null;
    if (!resolvedExpiresAt && user) {
      // Fetch user settings to apply default expiry
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });
      if (dbUser?.default_expiry_hours) {
        resolvedExpiresAt = new Date();
        resolvedExpiresAt.setHours(
          resolvedExpiresAt.getHours() + dbUser.default_expiry_hours
        );
      }
    }

    const [newLink] = await db
      .insert(links)
      .values({
        original_url: url,
        short_code: shortCode,
        user_id: user?.id || null,
        title: finalTitle,
        password_hash: passwordHash,
        expires_at: resolvedExpiresAt,
      })
      .returning();

    return NextResponse.json({ success: true, data: newLink });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
