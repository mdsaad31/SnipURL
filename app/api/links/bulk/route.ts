import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { requireAuth } from "../../../../lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const MAX_BULK_LIMIT = 50;

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(MAX_BULK_LIMIT),
});

const bulkPatchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(MAX_BULK_LIMIT),
  is_active: z.boolean(),
});

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = bulkDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: `Invalid request. Provide an array of 1-${MAX_BULK_LIMIT} link IDs.`,
          },
        },
        { status: 400 }
      );
    }

    const result = await db
      .delete(links)
      .where(
        and(
          inArray(links.id, parsed.data.ids),
          eq(links.user_id, user.id)
        )
      )
      .returning({ id: links.id });

    return NextResponse.json({
      success: true,
      data: { deleted: result.length },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("DELETE /api/links/bulk error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = bulkPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: `Invalid request. Provide an array of 1-${MAX_BULK_LIMIT} link IDs and is_active boolean.`,
          },
        },
        { status: 400 }
      );
    }

    const result = await db
      .update(links)
      .set({
        is_active: parsed.data.is_active,
        updated_at: new Date(),
      })
      .where(
        and(
          inArray(links.id, parsed.data.ids),
          eq(links.user_id, user.id)
        )
      )
      .returning({ id: links.id });

    return NextResponse.json({
      success: true,
      data: { updated: result.length },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("PATCH /api/links/bulk error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
