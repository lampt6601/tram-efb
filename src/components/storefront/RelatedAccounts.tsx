import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { AccountCard } from "./AccountCard";
import type { PublicAccount } from "@/types/database";

interface RelatedAccountsProps {
  currentAccountId: string;
  currentPrice: number;
  /** When true, only show available accounts (for sold account pages) */
  onlyAvailable?: boolean;
}

export async function RelatedAccounts({
  currentAccountId,
  currentPrice,
  onlyAvailable = false,
}: RelatedAccountsProps) {
  const supabase = createSupabaseAnonClient();

  // Price range: ±30% of current price, minimum 50k VND range
  const minPrice = Math.max(0, Math.floor(currentPrice * 0.7));
  const maxPrice = Math.ceil(currentPrice * 1.3);

  const { data } = await supabase
    .from("public_accounts")
    .select("*")
    .neq("id", currentAccountId)
    .gte("selling_price", minPrice)
    .lte("selling_price", maxPrice)
    .order("is_priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const accounts = (data ?? []) as PublicAccount[];

  // If not enough in price range, fetch latest accounts as fallback
  if (accounts.length < 2) {
    const existingIds = [currentAccountId, ...accounts.map((a) => a.id)];
    const { data: fallback } = await supabase
      .from("public_accounts")
      .select("*")
      .not("id", "in", `(${existingIds.join(",")})`)
      .order("is_priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3 - accounts.length);

    if (fallback) {
      accounts.push(...(fallback as PublicAccount[]));
    }
  }

  if (accounts.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">
        Tài Khoản Tương Tự
      </h2>
      {/* Horizontal scroll on mobile, grid on sm+ */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {accounts.map((account) => (
          <div key={account.id} className="w-[65vw] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink">
            <AccountCard account={account} />
          </div>
        ))}
      </div>
    </section>
  );
}
