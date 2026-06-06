import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { users } from "../../../lib/db/schema";
import { requireAuth } from "../../../lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSettingsSchema = z.object({
  default_expiry_hours: z.number().int().min(1).max(8760).nullable().optional(),
  link_limit: z.number().int().min(10).max(10000).optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: dbUser.email,
        default_expiry_hours: dbUser.default_expiry_hours,
        link_limit: dbUser.link_limit,
        created_at: dbUser.created_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("GET /api/settings error:", error);
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

    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Invalid settings data" } },
        { status: 400 }
      );
    }

    const updateData: Record<string, number | null | Date> = {
      updated_at: new Date(),
    };

    if (parsed.data.default_expiry_hours !== undefined) {
      updateData.default_expiry_hours = parsed.data.default_expiry_hours;
    }

    if (parsed.data.link_limit !== undefined) {
      updateData.link_limit = parsed.data.link_limit;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        email: updated.email,
        default_expiry_hours: updated.default_expiry_hours,
        link_limit: updated.link_limit,
        created_at: updated.created_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
