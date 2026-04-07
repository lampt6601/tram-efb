// DEPRECATED: This API route is no longer called by any client.
// NotificationBell now uses /api/pending-approvals instead.
// Returns 410 Gone to prevent accidental usage.

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "Deprecated. Use /api/pending-approvals." },
    { status: 410 },
  );
}

export function PATCH() {
  return NextResponse.json(
    { error: "Deprecated." },
    { status: 410 },
  );
}
