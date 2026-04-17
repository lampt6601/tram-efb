import {
  PARTNER_ACCESS_COOKIE_MAX_AGE_SECONDS,
  PARTNER_ACCESS_COOKIE_NAME,
  PARTNER_REF_QUERY_KEY,
  VALID_PARTNER_IDS,
} from "@thc-efb/shared/constants";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATH_PREFIXES = ["/_next", "/images", "/icons"];
const PUBLIC_EXACT_PATHS = ["/access-denied", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.json"];

const isWhitelistedPartner = (partnerId: string | undefined): partnerId is string =>
  Boolean(partnerId && VALID_PARTNER_IDS.includes(partnerId));

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_EXACT_PATHS.includes(pathname) || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    // Fetch setting and cache it for 60 seconds to avoid latency on every request
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_settings?select=value&key=eq.require_partner_ref`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        next: { revalidate: 60 },
      }
    );
    const data = await res.json();
    const requireRef = data?.[0]?.value === "true";

    if (!requireRef) {
      return NextResponse.next();
    }
  } catch (error) {
    // On fetch error, fallback to allowing access or default to block?
    // We'll fallback to not blocking to be safe and avoid full outage
    console.error("Error fetching require_partner_ref setting in middleware:", error);
    return NextResponse.next();
  }

  const ref = searchParams.get(PARTNER_REF_QUERY_KEY) ?? undefined;
  const cookiePartnerId = request.cookies.get(PARTNER_ACCESS_COOKIE_NAME)?.value;

  if (isWhitelistedPartner(ref)) {
    const response = NextResponse.next();
    response.cookies.set(PARTNER_ACCESS_COOKIE_NAME, ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PARTNER_ACCESS_COOKIE_MAX_AGE_SECONDS,
    });
    return response;
  }

  if (isWhitelistedPartner(cookiePartnerId)) {
    return NextResponse.next();
  }

  const deniedUrl = new URL("/access-denied", request.url);
  return NextResponse.redirect(deniedUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
