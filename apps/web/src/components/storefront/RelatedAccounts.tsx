import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';
import { AccountCard } from "./AccountCard";
import type { PublicAccount } from '@thc-efb/supabase/types';

interface RelatedAccountsProps {
  currentAccountId: string;
  currentPrice: number;
  /** When true, only show available accounts (for sold account pages) */
  onlyAvailable?: boolean;
}

const ACCOUNT_FIELDS = "id, title, selling_price, original_price, primary_image_url, images, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, server_region, created_at, seller_full_name, seller_avatar_url, seller_sold_count";

export async function RelatedAccounts({
  currentAccountId,
  currentPrice,
}: RelatedAccountsProps) {
  const supabase = createSupabaseAnonClient();

  // Fetch 6 accounts ordered by priority+recency — no price filter to avoid
  // a second waterfall fallback query. Slice to 3 after fetching.
  // Price range is applied as a soft preference via the query order, not a hard filter.
  const minPrice = Math.max(0, Math.floor(currentPrice * 0.7));
  const maxPrice = Math.ceil(currentPrice * 1.3);

  // Single query: prefer price-range matches, fall back to latest if < 3 results
  const [{ data: inRange }, { data: latest }] = await Promise.all([
    supabase
      .from("public_accounts")
      .select(ACCOUNT_FIELDS)
      .neq("id", currentAccountId)
      .gte("selling_price", minPrice)
      .lte("selling_price", maxPrice)
      .order("is_priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("public_accounts")
      .select(ACCOUNT_FIELDS)
      .neq("id", currentAccountId)
      .order("is_priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  // Prefer in-range accounts; fill remainder with latest (deduplicated)
  const inRangeList = (inRange ?? []) as PublicAccount[];
  const inRangeIds = new Set(inRangeList.map((a) => a.id));
  const extras = ((latest ?? []) as PublicAccount[]).filter(
    (a) => !inRangeIds.has(a.id),
  );
  const accounts = [...inRangeList, ...extras].slice(0, 3);

  if (accounts.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <h2 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">
        Tài Khoản Tương Tự
      </h2>
      {/* Horizontal scroll on mobile, grid on sm+ */}
      <div className="-mx-4 flex gap-3 overflow-x-auto pl-4 pr-4 pb-3 pt-2 snap-x snap-mandatory scroll-pl-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pl-0 sm:pr-0 sm:pb-0 lg:grid-cols-3">
        {accounts.map((account) => (
          <div key={account.id} className="w-[65vw] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink">
            <AccountCard account={account} />
          </div>
        ))}
      </div>
    </section>
  );
}
