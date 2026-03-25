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
    .limit(4);

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
      .limit(4 - accounts.length);

    if (fallback) {
      accounts.push(...(fallback as PublicAccount[]));
    }
  }

  if (accounts.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <h2 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
        Tài Khoản Tương Tự
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </section>
  );
}
