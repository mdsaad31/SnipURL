import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { links, users } from "../../../lib/db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { urlSchema } from "../../../lib/url-utils";
import { createUniqueShortCode, isValidCustomAlias, isAliasAvailable } from "../../../lib/short-code";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getClientIp, rateLimit, rateLimitHeaders } from "../../../lib/rate-limit";
import { toLinkResponse } from "../../../lib/link-response";

const createLinkSchema = z.object({
  url: urlSchema,
  customAlias: z.string().optional().nullable(),
  password: z.string().max(128, "Password must be 128 characters or fewer").optional().nullable(),
  expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
});

class LinkLimitReachedError extends Error {
  constructor() {
    super("LINK_LIMIT_REACHED");
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

    return NextResponse.json({ success: true, data: userLinks.map(toLinkResponse) });
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
    const { userId } = await auth();
    const limit = rateLimit(
      `link-create:${userId || getClientIp(req)}`,
      userId ? { limit: 60, windowMs: 15 * 60_000 } : { limit: 10, windowMs: 60 * 60_000 }
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many link creation requests. Please try again later." } },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = await req.json();
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { url, customAlias, password, expiresAt } = parsed.data;

    // Get user (can be null for anonymous)
    const user = await getCurrentUser();

    let shortCode = "";

    // Handle custom alias — requires authentication
    if (customAlias) {
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

      if (!isValidCustomAlias(customAlias)) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ALIAS", message: "Invalid custom alias. Use 3-50 alphanumeric characters or hyphens." } },
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

    // Hash password if provided
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const resolvedExpiry = expiresAt
      ? new Date(expiresAt)
      : user?.default_expiry_hours
        ? new Date(Date.now() + user.default_expiry_hours * 60 * 60 * 1000)
        : null;

    const [newLink] = await db.transaction(async (tx) => {
      if (user) {
        // Serialize creations per user so concurrent requests cannot exceed
        // the configured quota between a count and insert.
        await tx.execute(sql`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`);
        const [{ count }] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(links)
          .where(eq(links.user_id, user.id));

        if (count >= user.link_limit) {
          throw new LinkLimitReachedError();
        }
      }

      return tx
        .insert(links)
        .values({
          original_url: url,
          short_code: shortCode,
          user_id: user?.id || null,
          // Never fetch user-provided URLs from the server. It creates an SSRF
          // primitive and makes link creation dependent on third-party hosts.
          title: url,
          password_hash: passwordHash,
          expires_at: resolvedExpiry,
        })
        .returning();
    });

    return NextResponse.json({ success: true, data: toLinkResponse(newLink) });
  } catch (error) {
    if (error instanceof LinkLimitReachedError) {
      return NextResponse.json(
        { success: false, error: { code: "LINK_LIMIT_REACHED", message: "You have reached your link limit." } },
        { status: 403 }
      );
    }
    console.error("POST /api/links error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
