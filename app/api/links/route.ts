import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { links } from "../../../lib/db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { urlSchema, fetchUrlTitle } from "../../../lib/url-utils";
import { createUniqueShortCode, isValidCustomAlias, isAliasAvailable } from "../../../lib/short-code";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createLinkSchema = z.object({
  url: urlSchema,
  customAlias: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

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

    const { url, customAlias, password, expiresAt } = parsed.data;

    // Get user (can be null for anonymous)
    const user = await getCurrentUser();

    let shortCode = "";

    // Handle custom alias — requires authentication
    if (customAlias) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Sign in to use custom aliases" } },
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

    // Try to fetch title (non-blocking — falls back to URL)
    const title = await fetchUrlTitle(url);

    // Hash password if provided
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const [newLink] = await db
      .insert(links)
      .values({
        original_url: url,
        short_code: shortCode,
        user_id: user?.id || null,
        title: title || url,
        password_hash: passwordHash,
        expires_at: expiresAt ? new Date(expiresAt) : null,
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
