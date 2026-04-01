import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkIsSuperAdmin } from '@/lib/super-admin';

export async function middleware(request: NextRequest) {
  // Skip auth check entirely if no Supabase cookies exist
  // This prevents "Refresh Token Not Found" errors on stale/missing sessions
  const hasAuthCookies = request.cookies.getAll().some(({ name }) => name.startsWith('sb-'));

  if (!hasAuthCookies) {
    // No session at all — protect dashboard, allow login page
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
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

  // If refresh token is invalid/expired, clear stale cookies and redirect to login
  if (error) {
    const response = request.nextUrl.pathname.startsWith('/admin/dashboard')
      ? NextResponse.redirect(new URL('/admin/login', request.url))
      : NextResponse.next({ request });

    // Clear all stale sb-* cookies so the error doesn't repeat
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) {
        response.cookies.delete(name);
      }
    });
    return response;
  }

  // Protect admin dashboard routes
  if (request.nextUrl.pathname.startsWith('/admin/dashboard') && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Protect super admin routes
  if (
    request.nextUrl.pathname.startsWith('/admin/dashboard/super') &&
    !checkIsSuperAdmin(user?.email)
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // NOTE: Disabled admin check moved to dashboard layout.tsx
  // to avoid expensive DB query on every middleware invocation.
  // Layout already queries admin_settings for avatar — now also checks is_disabled.

  // Redirect logged-in users away from login page
  if (request.nextUrl.pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
