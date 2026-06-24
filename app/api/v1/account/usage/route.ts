import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { withApiAuth } from "@/lib/api-auth";
import { apiSuccess } from "@/lib/api-response";
import { eq, and } from "drizzle-orm";

export const GET = withApiAuth(async (req, { user, apiKey }) => {
  // List all active keys for user with basic info
  const keys = await db.query.apiKeys.findMany({
    where: and(eq(apiKeys.user_id, user.id), eq(apiKeys.is_revoked, false)),
    columns: {
      id: true,
      name: true,
      key_prefix: true,
      last_used_at: true,
      rate_limit_per_minute: true,
      rate_limit_per_hour: true,
      expires_at: true,
      created_at: true,
    },
  });

  return apiSuccess({
    current_key: {
      id: apiKey.id,
      name: apiKey.name,
      rate_limit_per_minute: apiKey.rate_limit_per_minute,
      rate_limit_per_hour: apiKey.rate_limit_per_hour,
    },
    active_keys: keys.length,
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      key_prefix: k.key_prefix,
      last_used_at: k.last_used_at,
      rate_limit_per_minute: k.rate_limit_per_minute,
      rate_limit_per_hour: k.rate_limit_per_hour,
      expires_at: k.expires_at,
      created_at: k.created_at,
    })),
  });
});
