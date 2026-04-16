/**
 * Cross-app revalidation helper.
 *
 * Calls the web app's /api/revalidate endpoint to invalidate
 * storefront cache after admin mutations.
 *
 * Non-blocking: never throws — logs errors and returns false.
 * Fire-and-forget by default (don't await in server actions).
 *
 * Requires env vars:
 *   WEB_URL            — e.g. "https://sap-efb.vercel.app"
 *   REVALIDATION_SECRET — shared secret matching the web app
 */

const WEB_URL = process.env.WEB_URL ?? "https://sap-efb.vercel.app";
const SECRET = process.env.REVALIDATION_SECRET;

async function callRevalidate(
  paths: string[],
  tags: string[] = [],
): Promise<boolean> {
  if (!SECRET) {
    console.error("[revalidateWeb] REVALIDATION_SECRET env var is not set.");
    return false;
  }

  try {
    const res = await fetch(`${WEB_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SECRET}`,
      },
      body: JSON.stringify({ paths, tags }),
    });

    if (!res.ok) {
      console.error("[revalidateWeb] Failed:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[revalidateWeb] Error:", error);
    return false;
  }
}

// ─── Convenience helpers ────────────────────────────────────────

/**
 * Revalidate after account create/update/delete.
 * Invalidates: homepage, account detail, seller shop, bao-ke.
 */
export function revalidateAccount(
  accountId?: string,
  sellerName?: string,
): Promise<boolean> {
  const paths = ["/", "/bao-ke"];
  if (accountId) paths.push(`/accounts/${accountId}`);
  if (sellerName) paths.push(`/shop/${sellerName}`);
  return callRevalidate(paths);
}

/**
 * Revalidate after account approval/rejection.
 * Same as revalidateAccount — approved accounts appear/disappear from public views.
 */
export function revalidateAccountApproval(
  accountId?: string,
  sellerName?: string,
): Promise<boolean> {
  return revalidateAccount(accountId, sellerName);
}

/**
 * Revalidate after seller/admin profile changes.
 * Invalidates: seller shop page, bao-ke, homepage (seller info in cards).
 */
export function revalidateSeller(sellerName?: string): Promise<boolean> {
  const paths = ["/", "/bao-ke"];
  if (sellerName) paths.push(`/shop/${sellerName}`);
  return callRevalidate(paths, ["admin-users"]);
}

/**
 * Revalidate after review approval.
 * Invalidates: account detail page (shows reviews), homepage.
 */
export function revalidateReview(accountId?: string): Promise<boolean> {
  const paths = ["/"];
  if (accountId) paths.push(`/accounts/${accountId}`);
  return callRevalidate(paths);
}

/**
 * Revalidate after site settings change.
 */
export function revalidateSiteSettings(): Promise<boolean> {
  return callRevalidate(["/"]);
}

/**
 * Generic: revalidate arbitrary web paths.
 */
export function revalidateWeb(
  paths: string[],
  tags: string[] = [],
): Promise<boolean> {
  return callRevalidate(paths, tags);
}
