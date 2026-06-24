import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";
import { apiKeys, users } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { hashApiKey } from "./api-keys";
import { checkRateLimit, getRateLimitHeaders } from "./rate-limit";
import { apiError } from "./api-response";

type User = typeof users.$inferSelect;
type ApiKey = typeof apiKeys.$inferSelect;

interface ApiContext {
  user: User;
  apiKey: ApiKey;
  params: Record<string, string>;
}

type ApiHandler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>;

function addHeaders(response: NextResponse, headers: Record<string, string>): NextResponse {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function withApiAuth(handler: ApiHandler) {
  return async (req: NextRequest, routeContext: { params: Promise<Record<string, string>> }) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return apiError("UNAUTHORIZED", "Missing or invalid Authorization header. Expected: Bearer <api_key>", 401);
    }

    const key = authHeader.slice(7);
    if (!key.startsWith("snip_live_") || key.length < 30) {
      return apiError("UNAUTHORIZED", "Invalid API key format.", 401);
    }

    const prefix = key.slice(0, 17);
    const keyHash = hashApiKey(key);

    const keyRecord = await db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.key_prefix, prefix),
        eq(apiKeys.is_revoked, false),
      ),
    });

    if (!keyRecord || keyRecord.key_hash !== keyHash) {
      return apiError("UNAUTHORIZED", "Invalid API key.", 401);
    }

    if (keyRecord.expires_at && keyRecord.expires_at < new Date()) {
      return apiError("KEY_EXPIRED", "This API key has expired.", 401);
    }

    const rateLimitResult = checkRateLimit(keyRecord.id, {
      perMinute: keyRecord.rate_limit_per_minute,
      perHour: keyRecord.rate_limit_per_hour,
    });

    if (!rateLimitResult.allowed) {
      const response = apiError(
        "RATE_LIMIT_EXCEEDED",
        `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter} seconds.`,
        429,
        { limit: rateLimitResult.limit, window: rateLimitResult.window, retry_after: rateLimitResult.retryAfter }
      );
      response.headers.set("Retry-After", String(rateLimitResult.retryAfter));
      return addHeaders(response, getRateLimitHeaders(rateLimitResult));
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, keyRecord.user_id),
    });

    if (!user) {
      return apiError("UNAUTHORIZED", "User account not found.", 401);
    }

    db.update(apiKeys)
      .set({ last_used_at: new Date() })
      .where(eq(apiKeys.id, keyRecord.id))
      .execute()
      .catch(() => {});

    const params = await routeContext.params;
    const response = await handler(req, { user, apiKey: keyRecord, params });
    return addHeaders(response, getRateLimitHeaders(rateLimitResult));
  };
}
