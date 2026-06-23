import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { links } from "../../../../../lib/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/analytics/public/[code]
// Returns analytics for a specific link by short_code, only if analytics_public=true.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find link by short_code
    const link = await db.query.links.findFirst({
      where: eq(links.short_code, code),
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Link not found." } },
        { status: 404 }
      );
    }

    if (!link.analytics_public) {
      return NextResponse.json(
        { success: false, error: { code: "PRIVATE", message: "Analytics for this link are private." } },
        { status: 403 }
      );
    }

    // Parse which fields are shared (defaults to all)
    const DEFAULT_FIELDS = ["clicks", "trend", "countries", "devices", "browsers", "referrers", "os"];
    let sharedFields: string[];
    try {
      sharedFields = link.analytics_shared_fields
        ? JSON.parse(link.analytics_shared_fields)
        : DEFAULT_FIELDS;
    } catch {
      sharedFields = DEFAULT_FIELDS;
    }

    const linkId = link.id;
    const data: Record<string, unknown> = {
      link: {
        short_code: link.short_code,
        title: link.title,
        original_url: link.original_url,
        is_active: link.is_active,
        created_at: link.created_at,
        clicks_count: link.clicks_count,
      },
      sharedFields,
    };

    // Total clicks
    if (sharedFields.includes("clicks")) {
      const [row] = await db.execute(sql`
        SELECT COUNT(*)::int AS count FROM clicks WHERE link_id = ${linkId}
      `);
      data.totalClicks = Number(row?.count) || 0;
    }

    // Click trend (30 days)
    if (sharedFields.includes("trend")) {
      data.timeSeries = await db.execute(sql`
        SELECT DATE(created_at) AS date, COUNT(*)::int AS count
        FROM clicks
        WHERE link_id = ${linkId}
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
    }

    // Countries
    if (sharedFields.includes("countries")) {
      data.countries = await db.execute(sql`
        SELECT country, COUNT(*)::int AS count
        FROM clicks WHERE link_id = ${linkId} AND country IS NOT NULL
        GROUP BY country ORDER BY count DESC LIMIT 10
      `);
    }

    // Devices
    if (sharedFields.includes("devices")) {
      data.devices = await db.execute(sql`
        SELECT device_type, COUNT(*)::int AS count
        FROM clicks WHERE link_id = ${linkId}
        GROUP BY device_type ORDER BY count DESC
      `);
    }

    // Browsers
    if (sharedFields.includes("browsers")) {
      data.browsers = await db.execute(sql`
        SELECT browser, COUNT(*)::int AS count
        FROM clicks WHERE link_id = ${linkId}
        GROUP BY browser ORDER BY count DESC LIMIT 6
      `);
    }

    // Referrers
    if (sharedFields.includes("referrers")) {
      data.referrers = await db.execute(sql`
        SELECT referrer, COUNT(*)::int AS count
        FROM clicks WHERE link_id = ${linkId}
        GROUP BY referrer ORDER BY count DESC LIMIT 8
      `);
    }

    // OS
    if (sharedFields.includes("os")) {
      data.os = await db.execute(sql`
        SELECT os, COUNT(*)::int AS count
        FROM clicks WHERE link_id = ${linkId}
        GROUP BY os ORDER BY count DESC LIMIT 6
      `);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/analytics/public/[code] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
