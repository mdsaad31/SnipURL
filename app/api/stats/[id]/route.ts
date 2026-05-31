import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { requireAuth } from "../../../../lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Total clicks
    const totalClicksResult = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM clicks WHERE link_id = ${id}
    `);
    const totalClicks = Number(totalClicksResult[0]?.count) || 0;

    // Time series (clicks per day)
    const timeSeries = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Top referrers
    const referrers = await db.execute(sql`
      SELECT referrer, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `);

    // Top countries
    const countries = await db.execute(sql`
      SELECT country, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id}
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);

    // Device breakdown
    const devices = await db.execute(sql`
      SELECT device_type, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id}
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // Browser breakdown
    const browsers = await db.execute(sql`
      SELECT browser, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      data: {
        link,
        totalClicks,
        timeSeries,
        referrers,
        countries,
        devices,
        browsers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("GET /api/stats/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
