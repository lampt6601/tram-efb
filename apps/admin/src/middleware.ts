import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkIsSuperAdmin } from '@thc-efb/shared/super-admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith('/dashboard');

  const hasAuthCookies = request.cookies.getAll().some(({ name }) => name.startsWith('sb-'));

  // API routes don't need auth middleware
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (!hasAuthCookies) {
    if (isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url));
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
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.webmanifest|icons/|images/).*)',
  ],
};
