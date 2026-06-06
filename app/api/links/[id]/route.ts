import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { requireAuth } from "../../../../lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateLinkSchema = z.object({
  title: z.string().optional(),
  is_active: z.boolean().optional(),
  password: z.string().nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    // FRAUD PREVENTION: Reject any attempt to change URL or alias
    if (body.original_url !== undefined || body.short_code !== undefined || body.url !== undefined) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "URL and alias cannot be changed after creation" } },
        { status: 400 }
      );
    }

    const parsed = updateLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Invalid request data" } },
        { status: 400 }
      );
    }

    // Ensure the link belongs to the user
    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.user_id, user.id)),
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Link not found" } },
        { status: 404 }
      );
    }

    // Build the update payload
    const updateData: Record<string, string | boolean | Date | null> = {
      updated_at: new Date(),
    };

    if (parsed.data.title !== undefined) {
      updateData.title = parsed.data.title;
    }

    if (parsed.data.is_active !== undefined) {
      updateData.is_active = parsed.data.is_active;
    }

    // Password handling
    if (parsed.data.password !== undefined) {
      if (parsed.data.password === null) {
        // Explicitly null → remove password
        updateData.password_hash = null;
      } else if (parsed.data.password.length > 0) {
        // Non-empty string → hash and set
        updateData.password_hash = await bcrypt.hash(parsed.data.password, 10);
      }
      // If empty string but not null, don't touch password_hash
    }

    // Expires_at handling
    if (parsed.data.expiresAt !== undefined) {
      if (parsed.data.expiresAt === null) {
        // Explicitly null → clear expiry
        updateData.expires_at = null;
      } else {
        // String → parse to Date
        updateData.expires_at = new Date(parsed.data.expiresAt);
      }
    }

    // Update only the owned link (scoped by user_id for safety)
    const [updatedLink] = await db
      .update(links)
      .set(updateData)
      .where(and(eq(links.id, id), eq(links.user_id, user.id)))
      .returning();

    return NextResponse.json({ success: true, data: updatedLink });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("PATCH /api/links/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Ensure the link belongs to the user
    const link = await db.query.links.findFirst({
      where: and(eq(links.id, id), eq(links.user_id, user.id)),
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Link not found" } },
        { status: 404 }
      );
    }

    await db.delete(links).where(and(eq(links.id, id), eq(links.user_id, user.id)));

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("DELETE /api/links/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
