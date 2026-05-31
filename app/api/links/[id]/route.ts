import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { requireAuth } from "../../../../lib/auth";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateLinkSchema = z.object({
  title: z.string().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

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

    // Update only the owned link (scoped by user_id for safety)
    const [updatedLink] = await db
      .update(links)
      .set({
        ...parsed.data,
        updated_at: new Date(),
      })
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
