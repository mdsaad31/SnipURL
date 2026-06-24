import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { eq, and, sql } from "drizzle-orm";

export const GET = withApiAuth(async (req, { user, params }) => {
  const link = await db.query.links.findFirst({
    where: and(eq(links.id, params.id), eq(links.user_id, user.id)),
  });

  if (!link) {
    return apiError("NOT_FOUND", "Link not found.", 404);
  }

  const url = new URL(req.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  const dateFilter =
    startParam && endParam
      ? sql` AND created_at >= ${startParam}::timestamptz AND created_at <= ${endParam}::timestamptz`
      : sql``;

  const [
    totalClicksResult,
    timeSeries,
    referrers,
    countries,
    cities,
    devices,
    browsers,
    os,
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int as count FROM clicks WHERE link_id = ${params.id} ${dateFilter}`),
    db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY DATE(created_at) ORDER BY date ASC
    `),
    db.execute(sql`
      SELECT referrer, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY referrer ORDER BY count DESC LIMIT 10
    `),
    db.execute(sql`
      SELECT country, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY country ORDER BY count DESC LIMIT 10
    `),
    db.execute(sql`
      SELECT city, country, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY city, country ORDER BY count DESC LIMIT 10
    `),
    db.execute(sql`
      SELECT device_type, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY device_type ORDER BY count DESC
    `),
    db.execute(sql`
      SELECT browser, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY browser ORDER BY count DESC LIMIT 10
    `),
    db.execute(sql`
      SELECT os, COUNT(*)::int as count
      FROM clicks WHERE link_id = ${params.id} ${dateFilter}
      GROUP BY os ORDER BY count DESC LIMIT 10
    `),
  ]);

  return apiSuccess({
    link_id: link.id,
    short_code: link.short_code,
    total_clicks: Number(totalClicksResult[0]?.count) || 0,
    time_series: timeSeries,
    referrers,
    countries,
    cities,
    devices,
    browsers,
    os,
  });
});
