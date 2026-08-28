type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

// This is deliberately a small, best-effort local limiter. For multi-instance
// deployments, replace it with a shared provider (for example Redis or the
// platform's rate-limiting service) while preserving this call-site contract.
const requests = new Map<string, RateLimitEntry>();
let lastCleanupAt = 0;

function cleanup(now: number) {
  if (now - lastCleanupAt < 60_000) return;
  lastCleanupAt = now;

  requests.forEach((entry, key) => {
    if (entry.resetAt <= now) requests.delete(key);
  });
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const existing = requests.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    requests.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))) }),
  };
}
