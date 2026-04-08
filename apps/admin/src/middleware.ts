import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkIsSuperAdmin } from '@thc-efb/shared/super-admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  // Only run auth logic for routes that actually need it
  if (!isDashboard && !isLogin) {
    return NextResponse.next();
  }

  const hasAuthCookies = request.cookies.getAll().some(({ name }) => name.startsWith('sb-'));

  // No cookies + dashboard → redirect to login (no Supabase call needed)
  if (!hasAuthCookies) {
    if (isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Only call supabase.auth.getUser() for /dashboard/* and /login
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
    if (isDashboard) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      request.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) res.cookies.delete(name);
      });
      return res;
    }
    return NextResponse.next({ request });
  }

  // Protect /dashboard routes
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect super admin routes
  if (pathname.startsWith('/dashboard/super') && !checkIsSuperAdmin(user?.email)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect logged-in users away from login page
  if (isLogin && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
