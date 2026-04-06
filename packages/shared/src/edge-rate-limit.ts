/**
 * Edge-compatible rate limiter using Upstash Redis (Vercel KV).
 *
 * Requires env vars:
 *   - UPSTASH_REDIS_REST_URL
 *   - UPSTASH_REDIS_REST_TOKEN
 *
 * These are auto-set when you create a Vercel KV store.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─── Rate limit tiers ───────────────────────────────────────────────

export type RateLimitTier = 'general' | 'api' | 'auth' | 'strict';

const TIER_CONFIG: Record<RateLimitTier, { requests: number; window: string }> = {
  /** Normal page browsing: 100 requests per 60s */
  general: { requests: 100, window: '60 s' },
  /** API routes: 30 requests per 60s */
  api: { requests: 30, window: '60 s' },
  /** Login / auth endpoints: 10 requests per 60s */
  auth: { requests: 10, window: '60 s' },
  /** Sensitive actions (approve, reject): 5 requests per 60s */
  strict: { requests: 5, window: '60 s' },
};

// ─── Singleton instances (one per tier) ─────────────────────────────

let redis: Redis | null = null;
const instances = new Map<RateLimitTier, Ratelimit>();

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function getRateLimiter(tier: RateLimitTier): Ratelimit | null {
  const cached = instances.get(tier);
  if (cached) return cached;

  const r = getRedis();
  if (!r) return null;

  const config = TIER_CONFIG[tier];
  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(
      config.requests,
      config.window as Parameters<typeof Ratelimit.slidingWindow>[1],
    ),
    analytics: true,
    prefix: `ratelimit:${tier}`,
  });
  instances.set(tier, limiter);
  return limiter;
}

// ─── Public API ─────────────────────────────────────────────────────

export interface EdgeRateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

/**
 * Check rate limit for a given IP + tier.
 * Returns null if Redis is not configured (graceful degradation).
 */
export async function edgeRateLimit(
  ip: string,
  tier: RateLimitTier,
): Promise<EdgeRateLimitResult | null> {
  const limiter = getRateLimiter(tier);
  if (!limiter) return null; // Redis not configured — skip rate limiting

  const result = await limiter.limit(ip);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    pending: result.pending,
  };
}

/**
 * Set rate-limit response headers for transparency.
 */
export function edgeRateLimitHeaders(
  result: EdgeRateLimitResult,
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
  if (!result.success) {
    headers['Retry-After'] = String(
      Math.ceil((result.reset - Date.now()) / 1000),
    );
  }
  return headers;
}

// ─── Route → tier mapping helper ────────────────────────────────────

/** Paths that should be skipped entirely (static assets, etc.) */
const SKIP_PATTERNS = [
  /^\/_next\//,
  /^\/favicon/,
  /^\/sw\.js/,
  /^\/manifest/,
  /^\/icons\//,
  /^\/images\//,
  /\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js|map)$/,
];

/**
 * Determine the rate limit tier for a given pathname.
 * Returns null if the path should be skipped (static assets).
 */
export function getTierForPath(pathname: string): RateLimitTier | null {
  // Skip static assets
  if (SKIP_PATTERNS.some((p) => p.test(pathname))) return null;

  // Auth endpoints — strictest
  if (pathname === '/login' || pathname.startsWith('/api/auth')) return 'auth';

  // Sensitive API actions
  if (
    pathname.startsWith('/api/approve') ||
    pathname.startsWith('/api/push-subscribe')
  ) {
    return 'strict';
  }

  // General API routes
  if (pathname.startsWith('/api/')) return 'api';

  // Everything else (pages)
  return 'general';
}

/**
 * Extract client IP from request headers.
 * Works on Vercel Edge (x-forwarded-for) and other platforms.
 */
export function getEdgeClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
