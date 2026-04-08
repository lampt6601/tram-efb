import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * On-demand revalidation endpoint for cross-app cache invalidation.
 *
 * Called by the admin app after mutations that affect public storefront pages.
 * Protected by a shared secret token (REVALIDATION_SECRET env var).
 *
 * Usage:
 *   POST /api/revalidate
 *   Authorization: Bearer <REVALIDATION_SECRET>
 *   Body: { "paths": ["/", "/accounts/123"], "tags": ["admin-users"] }
 *
 * - paths: array of storefront paths to revalidate
 * - tags: array of cache tags to revalidate (optional)
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    console.error("[revalidate] REVALIDATION_SECRET env var is not set.");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Validate token
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paths: string[] = body.paths ?? [];
    const tags: string[] = body.tags ?? [];

    // Revalidate paths
    for (const path of paths) {
      revalidatePath(path);
    }

    // Revalidate tags
    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      tags,
      now: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
