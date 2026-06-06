import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { links } from "../../../../lib/db/schema";
import { requireAuth } from "../../../../lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Parse optional date range filters
    const startParam = req.nextUrl.searchParams.get("start");
    const endParam = req.nextUrl.searchParams.get("end");
    const format = req.nextUrl.searchParams.get("format");
    const raw = req.nextUrl.searchParams.get("raw");

    // Build date filter SQL fragment
    const dateFilter =
      startParam && endParam
        ? sql` AND created_at >= ${startParam}::timestamptz AND created_at <= ${endParam}::timestamptz`
        : sql``;

    // ── CSV Export ─────────────────────────────────────────────────────
    if (format === "csv") {
      let csvContent: string;
      let filename: string;

      if (raw === "true") {
        // Raw individual click rows
        const rows = await db.execute(sql`
          SELECT 
            created_at, country, city, device_type, browser, os, referrer
          FROM clicks
          WHERE link_id = ${id} ${dateFilter}
          ORDER BY created_at DESC
        `);

        const header = "created_at,country,city,device_type,browser,os,referrer";
        const lines = rows.map((r: Record<string, unknown>) =>
          [
            r.created_at,
            r.country ?? "",
            r.city ?? "",
            r.device_type ?? "",
            r.browser ?? "",
            r.os ?? "",
            r.referrer ?? "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
        csvContent = [header, ...lines].join("\n");
        filename = `snip-clicks-raw-${link.short_code}.csv`;
      } else {
        // Aggregated CSV
        const rows = await db.execute(sql`
          SELECT 
            DATE(created_at) as date, 
            country, 
            device_type, 
            browser, 
            os, 
            referrer, 
            COUNT(*)::int as count
          FROM clicks
          WHERE link_id = ${id} ${dateFilter}
          GROUP BY DATE(created_at), country, device_type, browser, os, referrer
          ORDER BY date DESC
        `);

        const header = "date,country,device_type,browser,os,referrer,count";
        const lines = rows.map((r: Record<string, unknown>) =>
          [
            r.date,
            r.country ?? "",
            r.device_type ?? "",
            r.browser ?? "",
            r.os ?? "",
            r.referrer ?? "",
            r.count,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
        csvContent = [header, ...lines].join("\n");
        filename = `snip-clicks-${link.short_code}.csv`;
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // ── JSON Analytics ────────────────────────────────────────────────

    // Total clicks
    const totalClicksResult = await db.execute(sql`
      SELECT COUNT(*)::int as count FROM clicks WHERE link_id = ${id} ${dateFilter}
    `);
    const totalClicks = Number(totalClicksResult[0]?.count) || 0;

    // Time series (clicks per day)
    const timeSeries = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id} ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Top referrers
    const referrers = await db.execute(sql`
      SELECT referrer, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id} ${dateFilter}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `);

    // Top countries
    const countries = await db.execute(sql`
      SELECT country, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id} ${dateFilter}
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);

    // Device breakdown
    const devices = await db.execute(sql`
      SELECT device_type, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id} ${dateFilter}
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // Browser breakdown
    const browsers = await db.execute(sql`
      SELECT browser, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id} ${dateFilter}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 5
    `);

    // OS breakdown
    const os = await db.execute(sql`
      SELECT os, COUNT(*)::int as count 
      FROM clicks 
      WHERE link_id = ${id} ${dateFilter}
      GROUP BY os
      ORDER BY count DESC
      LIMIT 10
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
        os,
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
