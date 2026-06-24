interface WindowState {
  count: number;
  startTime: number;
}

interface RateLimitState {
  minute: WindowState;
  hour: WindowState;
}

export interface RateLimitConfig {
  perMinute: number;
  perHour: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  window: string;
  retryAfter: number;
}

const store = new Map<string, RateLimitState>();

const CLEANUP_KEY = "__snip_rate_limit_cleanup__";
if (typeof globalThis !== "undefined" && !(globalThis as Record<string, unknown>)[CLEANUP_KEY]) {
  (globalThis as Record<string, unknown>)[CLEANUP_KEY] = setInterval(() => {
    const now = Date.now();
    store.forEach((state, id) => {
      if (now - state.hour.startTime > 3_600_000) {
        store.delete(id);
      }
    });
  }, 300_000);
}

export function checkRateLimit(keyId: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  let state = store.get(keyId);

  if (!state) {
    state = {
      minute: { count: 0, startTime: now },
      hour: { count: 0, startTime: now },
    };
    store.set(keyId, state);
  }

  if (now - state.minute.startTime >= 60_000) {
    state.minute = { count: 0, startTime: now };
  }
  if (now - state.hour.startTime >= 3_600_000) {
    state.hour = { count: 0, startTime: now };
  }

  if (state.minute.count >= config.perMinute) {
    const resetAt = Math.ceil((state.minute.startTime + 60_000) / 1000);
    return {
      allowed: false,
      limit: config.perMinute,
      remaining: 0,
      resetAt,
      window: "1m",
      retryAfter: Math.max(1, resetAt - Math.floor(now / 1000)),
    };
  }

  if (state.hour.count >= config.perHour) {
    const resetAt = Math.ceil((state.hour.startTime + 3_600_000) / 1000);
    return {
      allowed: false,
      limit: config.perHour,
      remaining: 0,
      resetAt,
      window: "1h",
      retryAfter: Math.max(1, resetAt - Math.floor(now / 1000)),
    };
  }

  state.minute.count++;
  state.hour.count++;

  const minuteResetAt = Math.ceil((state.minute.startTime + 60_000) / 1000);
  return {
    allowed: true,
    limit: config.perMinute,
    remaining: config.perMinute - state.minute.count,
    resetAt: minuteResetAt,
    window: "1m",
    retryAfter: 0,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
  };
}
