import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess } from "@/lib/api-response";
import { eq, sql, count, sum } from "drizzle-orm";

export const GET = withApiAuth(async (req, { user }) => {
  const url = new URL(req.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  // Total links and total clicks across all user's links
  const [linksStats] = await db
    .select({
      total_links: count(),
      total_clicks: sum(links.clicks_count),
    })
    .from(links)
    .where(eq(links.user_id, user.id));

  const activeLinks = await db
    .select({ count: count() })
    .from(links)
    .where(sql`${links.user_id} = ${user.id} AND ${links.is_active} = true`);

  // Clicks over time (across all user links)
  const dateFilter =
    startParam && endParam
      ? sql` AND c.created_at >= ${startParam}::timestamptz AND c.created_at <= ${endParam}::timestamptz`
      : sql``;

  const clicksOverTime = await db.execute(sql`
    SELECT DATE(c.created_at) as date, COUNT(*)::int as count
    FROM clicks c
    INNER JOIN links l ON c.link_id = l.id
    WHERE l.user_id = ${user.id} ${dateFilter}
    GROUP BY DATE(c.created_at)
    ORDER BY date ASC
  `);

  // Top performing links
  const topLinks = await db.execute(sql`
    SELECT id, short_code, original_url, title, clicks_count
    FROM links
    WHERE user_id = ${user.id}
    ORDER BY clicks_count DESC
    LIMIT 5
  `);

  return apiSuccess({
    total_links: linksStats?.total_links ?? 0,
    active_links: activeLinks[0]?.count ?? 0,
    total_clicks: Number(linksStats?.total_clicks) || 0,
    clicks_over_time: clicksOverTime,
    top_links: topLinks,
  });
});
