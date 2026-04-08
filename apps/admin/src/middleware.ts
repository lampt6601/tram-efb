import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkIsSuperAdmin } from '@thc-efb/shared/super-admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith('/dashboard');
  const isTmaDashboard = pathname.startsWith('/tma/dashboard');

  const hasAuthCookies = request.cookies.getAll().some(({ name }) => name.startsWith('sb-'));

  // API routes don't need auth middleware
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

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
