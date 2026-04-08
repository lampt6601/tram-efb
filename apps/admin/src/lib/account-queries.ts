/** Shared select clause for account listing queries */
export const ACCOUNT_SELECT =
  "id, title, description, selling_price, purchase_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, is_approved, is_rejected, rejection_reason, reviewed_by, reviewed_at, server_region, monthly_log_quota, email_id, user_id, created_at, updated_at, emails(*)" as const;

/**
 * Apply sort to a Supabase query builder.
 * Handles common sort options shared across account listing pages.
 * Returns the query for chaining. Unknown sort values default to newest.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySortToQuery<Q extends { order: (...args: any[]) => any }>(
  query: Q,
  sort: string,
): Q {
  switch (sort) {
    case "oldest":
      return query.order("created_at", { ascending: true });
    case "price_asc":
      return query.order("selling_price", { ascending: true });
    case "price_desc":
      return query.order("selling_price", { ascending: false });
    case "purchase_asc":
      return query.order("purchase_price", { ascending: true });
    case "purchase_desc":
      return query.order("purchase_price", { ascending: false });
    case "gp_desc":
      return query.order("total_gp", { ascending: false });
    case "strength_desc":
      return query.order("team_strength", { ascending: false });
    default:
      return query.order("created_at", { ascending: false });
  }
}
