import { NextResponse, type NextRequest } from 'next/server';
import {
  edgeRateLimit,
  edgeRateLimitHeaders,
  getEdgeClientIp,
  getTierForPath,
} from '@thc-efb/shared/edge-rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tier = getTierForPath(pathname);

  // Static assets — skip rate limiting
  if (!tier) return NextResponse.next();

  const ip = getEdgeClientIp(request);

  try {
    const result = await edgeRateLimit(ip, tier);

    // Redis not configured — graceful pass-through
    if (!result) return NextResponse.next();

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...edgeRateLimitHeaders(result),
          },
        },
      );
    }
  } catch {
    // Upstash quota exceeded or Redis unavailable — allow request through
    // rather than crashing the entire site with 500
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static assets:
     * - _next/static, _next/image
     * - favicon, sw.js, manifest, icons, images
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.webmanifest|icons/|images/).*)',
  ],
};
