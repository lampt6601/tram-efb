import {
  PARTNER_ACCESS_COOKIE_MAX_AGE_SECONDS,
  PARTNER_ACCESS_COOKIE_NAME,
  PARTNER_REF_QUERY_KEY,
  VALID_PARTNER_IDS,
} from "@thc-efb/shared/constants";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATH_PREFIXES = ["/_next", "/images", "/icons"];
const PUBLIC_EXACT_PATHS = ["/access-denied", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.json", "/sw.js"];

const isWhitelistedPartner = (partnerId: string | undefined): partnerId is string =>
  Boolean(partnerId && VALID_PARTNER_IDS.includes(partnerId));

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_EXACT_PATHS.includes(pathname) || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublicPath(pathname)) {
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
