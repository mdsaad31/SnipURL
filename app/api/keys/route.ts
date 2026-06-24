import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { generateApiKey, MAX_KEYS_PER_USER } from "@/lib/api-keys";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  expires_in: z.enum(["never", "30d", "90d", "1y"]).optional().default("never"),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.user_id, user.id),
      columns: {
        id: true,
        name: true,
        key_prefix: true,
        last_used_at: true,
        expires_at: true,
        is_revoked: true,
        rate_limit_per_minute: true,
        rate_limit_per_hour: true,
        created_at: true,
      },
      orderBy: (apiKeys, { desc }) => [desc(apiKeys.created_at)],
    });

    return NextResponse.json({ success: true, data: keys });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("GET /api/keys error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = createKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request data.", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    // Check key limit
    const existingKeys = await db.query.apiKeys.findMany({
      where: and(eq(apiKeys.user_id, user.id), eq(apiKeys.is_revoked, false)),
      columns: { id: true },
    });

    if (existingKeys.length >= MAX_KEYS_PER_USER) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: `Maximum ${MAX_KEYS_PER_USER} active API keys allowed. Revoke an existing key first.` } },
        { status: 403 }
      );
    }

    const { fullKey, prefix, hash } = generateApiKey();

    // Calculate expiry
    let expiresAt: Date | null = null;
    if (parsed.data.expires_in !== "never") {
      expiresAt = new Date();
      switch (parsed.data.expires_in) {
        case "30d": expiresAt.setDate(expiresAt.getDate() + 30); break;
        case "90d": expiresAt.setDate(expiresAt.getDate() + 90); break;
        case "1y": expiresAt.setFullYear(expiresAt.getFullYear() + 1); break;
      }
    }

    const [newKey] = await db
      .insert(apiKeys)
      .values({
        user_id: user.id,
        name: parsed.data.name,
        key_prefix: prefix,
        key_hash: hash,
        expires_at: expiresAt,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newKey.id,
        name: newKey.name,
        key: fullKey,
        key_prefix: newKey.key_prefix,
        expires_at: newKey.expires_at,
        created_at: newKey.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("POST /api/keys error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
