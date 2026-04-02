import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // No admin routes in web app — middleware is a no-op.
  // Keep this file for future route protection if needed.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
