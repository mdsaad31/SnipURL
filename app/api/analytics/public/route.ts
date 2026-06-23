import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { sql } from "drizzle-orm";

// GET /api/analytics/public
// Returns aggregate platform-wide stats (no auth required, includes all links).
export async function GET() {
  try {
    // ── Summary counters ─────────────────────────────────────────────
    const [summary] = await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM links)               AS total_links,
        (SELECT COUNT(*)::int FROM links WHERE is_active = true) AS active_links,
        (SELECT COALESCE(SUM(clicks_count), 0)::int FROM links) AS total_clicks,
        (SELECT COUNT(*)::int FROM links
          WHERE created_at >= NOW() - INTERVAL '24 hours') AS links_today,
        (SELECT COUNT(*)::int FROM clicks
          WHERE created_at >= NOW() - INTERVAL '24 hours') AS clicks_today
    `);

    // ── Click trend — last 30 days ───────────────────────────────────
    const clickTrend = await db.execute(sql`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM clicks
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // ── Links created per day — last 30 days ─────────────────────────
    const linkGrowth = await db.execute(sql`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM links
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // ── Top countries ────────────────────────────────────────────────
    const countries = await db.execute(sql`
      SELECT country, COUNT(*)::int AS count
      FROM clicks
      WHERE country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `);

    // ── Top referrers ────────────────────────────────────────────────
    const referrers = await db.execute(sql`
      SELECT referrer, COUNT(*)::int AS count
      FROM clicks
      WHERE referrer IS NOT NULL AND referrer != 'Direct'
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 8
    `);

    // ── Device breakdown ─────────────────────────────────────────────
    const devices = await db.execute(sql`
      SELECT device_type, COUNT(*)::int AS count
      FROM clicks
      WHERE device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // ── Browser breakdown ────────────────────────────────────────────
    const browsers = await db.execute(sql`
      SELECT browser, COUNT(*)::int AS count
      FROM clicks
      WHERE browser IS NOT NULL
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 6
    `);

    // ── OS breakdown ─────────────────────────────────────────────────
    const os = await db.execute(sql`
      SELECT os, COUNT(*)::int AS count
      FROM clicks
      WHERE os IS NOT NULL
      GROUP BY os
      ORDER BY count DESC
      LIMIT 6
    `);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        clickTrend,
        linkGrowth,
        countries,
        referrers,
        devices,
        browsers,
        os,
      },
    });
  } catch (error) {
    console.error("GET /api/analytics/public error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
