/**
 * Simple in-memory rate limiter for serverless environments.
 * Uses a sliding window approach with automatic cleanup.
 *
 * NOTE: This works per-instance. In Vercel serverless, each cold start
 * gets its own memory. This is sufficient for most use cases.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks (every 60s)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  // Window expired or first request
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: config.limit - 1, resetAt: now + windowMs };
  }

  // Within window
  if (entry.count < config.limit) {
    entry.count++;
    return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
  }

  // Rate limited
  return { success: false, remaining: 0, resetAt: entry.resetAt };
}

/**
 * Extract a rate-limit key from request headers.
 * Uses x-forwarded-for (Vercel), x-real-ip, or falls back to "anonymous".
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "anonymous"
  );
}

/**
 * Create rate-limit response headers for transparency.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
    ...(result.success ? {} : { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  };
}
