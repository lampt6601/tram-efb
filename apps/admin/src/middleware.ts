import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkIsSuperAdmin } from '@thc-efb/shared/super-admin';
import {
  edgeRateLimit,
  edgeRateLimitHeaders,
  getEdgeClientIp,
  getTierForPath,
} from '@thc-efb/shared/edge-rate-limit';

// ─── Rate limiting ──────────────────────────────────────────────────

async function checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const tier = getTierForPath(pathname);
  if (!tier) return null; // Static asset — skip

  const ip = getEdgeClientIp(request);
  const result = await edgeRateLimit(ip, tier);
  if (!result) return null; // Redis not configured — graceful pass-through

  if (!result.success) {
    // Return 429 with rate limit headers
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

  // Pass through — headers will be added to final response
  return null;
}

// ─── Auth middleware ─────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // 1. Rate limit check FIRST (before any Supabase call)
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith('/dashboard');
  const isTmaDashboard = pathname.startsWith('/tma/dashboard');

  // API routes don't need auth middleware — only rate limiting
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const hasAuthCookies = request.cookies.getAll().some(({ name }) => name.startsWith('sb-'));

  if (!hasAuthCookies) {
    if (isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isTmaDashboard) {
      const from = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/tma/loading?from=${from}`, request.url));
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    const clearCookies = (response: NextResponse) => {
      request.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) response.cookies.delete(name);
      });
      return response;
    };

    if (isDashboard) {
      return clearCookies(NextResponse.redirect(new URL('/login', request.url)));
    }
    if (isTmaDashboard) {
      const from = encodeURIComponent(pathname + request.nextUrl.search);
      return clearCookies(NextResponse.redirect(new URL(`/tma/loading?from=${from}`, request.url)));
    }
    return NextResponse.next({ request });
  }

  // Protect /dashboard routes
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect /tma/dashboard routes
  if (isTmaDashboard && !user) {
    const from = encodeURIComponent(pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/tma/loading?from=${from}`, request.url));
  }

  // Protect super admin routes (both /dashboard/super and /tma/dashboard/super)
  if (
    (pathname.startsWith('/dashboard/super') || pathname.startsWith('/tma/dashboard/super')) &&
    !checkIsSuperAdmin(user?.email)
  ) {
    return NextResponse.redirect(
      new URL(isDashboard ? '/dashboard' : '/tma/dashboard', request.url)
    );
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - sw.js, manifest files
     * - Static assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.webmanifest|icons/|images/).*)',
  ],
};
