import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const key = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.id, id), eq(apiKeys.user_id, user.id)),
    });

    if (!key) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "API key not found." } },
        { status: 404 }
      );
    }

    if (key.is_revoked) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "API key is already revoked." } },
        { status: 400 }
      );
    }

    await db
      .update(apiKeys)
      .set({ is_revoked: true })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.user_id, user.id)));

    return NextResponse.json({ success: true, data: { revoked: true } });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("DELETE /api/keys/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
