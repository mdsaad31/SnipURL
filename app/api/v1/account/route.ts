import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess } from "@/lib/api-response";
import { eq, count, sum } from "drizzle-orm";

export const GET = withApiAuth(async (req, { user }) => {
  const [stats] = await db
    .select({
      total_links: count(),
      total_clicks: sum(links.clicks_count),
    })
    .from(links)
    .where(eq(links.user_id, user.id));

  return apiSuccess({
    id: user.id,
    email: user.email,
    link_limit: user.link_limit,
    default_expiry_hours: user.default_expiry_hours,
    total_links: stats?.total_links ?? 0,
    total_clicks: Number(stats?.total_clicks) || 0,
    created_at: user.created_at,
  });
});
