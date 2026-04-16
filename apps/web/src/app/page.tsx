import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { AccountCard } from "@/components/storefront/AccountCard";
import { AccountFilters } from "@/components/storefront/AccountFilters";
import { StatsBar } from "@/components/storefront/StatsBar";
import { ScrollReveal } from '@thc-efb/ui/scroll-reveal';
import { AutoScrollSlider } from '@thc-efb/ui/auto-scroll-slider';
import { Search, BadgeCheck, Flame, Clock, Sparkles, ShieldCheck } from "lucide-react";
import { RecruitHeroCTA } from "@/components/storefront/RecruitHeroCTA";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { PublicAccount } from '@thc-efb/supabase/types';
import { FiltersSkeleton } from "@/components/storefront/AccountCardSkeleton";
import Link from "next/link";

export const revalidate = 300; // 5 minutes — balances freshness with Vercel edge requests

export const metadata: Metadata = {
  title:
    "Sạp Acc eFootball | Shop Tài Khoản eFootball Uy Tín",
  description:
    "Sạp Acc eFootball - shop tài khoản eFootball uy tín, cập nhật tài khoản chất lượng mỗi ngày và hỗ trợ nhanh qua Box cộng đồng.",
  alternates: {
    canonical: "https://thc-efb.com",
  },
  openGraph: {
    title:
      "Sạp Acc eFootball | Shop Tài Khoản eFootball Uy Tín",
    description:
      "Shop tài khoản eFootball uy tín, cập nhật tài khoản chất lượng mỗi ngày tại Sạp Acc eFootball.",
    url: "/",
    images: [
      {
        url: "/icon-shop.png",
        width: 1200,
        height: 630,
        alt: "Sạp Acc eFootball - Shop Tai Khoan eFootball",
      },
    ],
  },
};

type SearchParams = {
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  clone?: string;
  sort?: string;
  server?: string;
  minStrength?: string;
  minGp?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null;
  const searchQuery = params.q;
  const cloneOnly = params.clone === "1";
  const sort = params.sort ?? "newest";
  const serverFilter = params.server ?? "";
  const minStrength = params.minStrength ? parseInt(params.minStrength, 10) : null;
  const minGp = params.minGp ? parseInt(params.minGp, 10) : null;

  const supabase = createSupabaseAnonClient();

  // Build the accounts query with all filters
  let query = supabase.from("public_accounts").select(
    "id, title, selling_price, original_price, primary_image_url, images, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, server_region, monthly_log_quota, created_at, seller_full_name, seller_avatar_url, seller_sold_count, seller_collateral_amount",
  );

  if (minPrice !== null) query = query.gte("selling_price", minPrice);
  if (maxPrice !== null) query = query.lte("selling_price", maxPrice);
  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);
  if (cloneOnly) query = query.eq("is_clone", true);
  if (serverFilter) query = query.eq("server_region", serverFilter);
  if (minStrength !== null) query = query.gte("team_strength", minStrength);
  if (minGp !== null) query = query.gte("total_gp", minGp);

  // Priority accounts first, then sort
  query = query.order("is_priority", { ascending: false, nullsFirst: false });

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "price_asc":
      query = query.order("selling_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("selling_price", { ascending: false });
      break;
    case "strength_desc":
      query = query.order("team_strength", { ascending: false, nullsFirst: false });
      break;
    case "gp_desc":
      query = query.order("total_gp", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Run all three queries in parallel to avoid waterfall
  const [
    { data: accounts },
    { data: soldAccountsRaw },
    { data: serverData },
  ] = await Promise.all([
    query,
    supabase
      .from("public_sold_accounts")
      .select(
        "id, title, selling_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("public_accounts")
      .select("server_region"),
  ]);
  const serverRegions = [
    ...new Set(
      (serverData ?? [])
        .map((r: { server_region: string | null }) => r.server_region)
        .filter(Boolean) as string[],
    ),
  ].sort();

  const allItems = (accounts ?? []) as PublicAccount[];
  const soldItems = (soldAccountsRaw ?? []) as PublicAccount[];

  const priorityItems = allItems.filter((a) => a.is_priority);
  const regularItems = allItems.filter((a) => !a.is_priority);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 py-1 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="flex flex-col py-2 sm:py-6 md:py-10">
              <div className="text-center lg:text-left">
                <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-200 lg:mx-0">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                  Kho acc cập nhật mỗi ngày
                </div>
                <h1 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Sạp Acc eFootball
                  <span className="mt-1 block text-indigo-300">
                    Giá tốt - Đa dạng - Uy tín
                  </span>
                </h1>
                <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-2 lg:mx-0 lg:justify-start">
                  <Link
                    href="#accounts"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Xem tài khoản đang bán
                  </Link>
                  <a
                    href="https://zalo.me/g/a3v3dgaj4ugylmmnwk0u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-300/25 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
                  >
                    Box Acc Zalo
                  </a>
                </div>
                {/* Recruitment CTA */}
                <RecruitHeroCTA />
                {/* Social proof stats */}
                <StatsBar />
              </div>
            </div>
          </div>
        </section>

        {/* Account Grid */}
        <section
          id="accounts"
          className="mx-auto max-w-7xl scroll-mt-4 px-3 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-10"
        >
          <ScrollReveal direction="left" className="mb-3 sm:mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
              Tài Khoản Đang Bán
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={120} className="mb-5 sm:mb-8">
            <Suspense fallback={<FiltersSkeleton />}>
              <AccountFilters totalCount={allItems.length} serverRegions={serverRegions} />
            </Suspense>
          </ScrollReveal>

          {allItems.length === 0 ? (
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-20">
                <Search className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                  Không tìm thấy tài khoản nào
                </h3>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  Thử thay đổi bộ lọc hoặc xoá bộ lọc để xem tất cả.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="space-y-10">
              {/* Featured accounts */}
              {priorityItems.length > 0 && (
                <div>
                  <ScrollReveal direction="left" className="mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <h3 className="text-base font-semibold text-orange-600 uppercase tracking-wide dark:text-orange-400">
                        Tài Khoản Nổi Bật
                      </h3>
                    </div>
                  </ScrollReveal>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:items-stretch">
                    {priorityItems.map((account, i) => (
                      <ScrollReveal
                        key={account.id}
                        delay={i * 80}
                        distance="sm"
                        className="h-full min-h-0"
                      >
                        <AccountCard account={account} priority={i < 3} hideSellerInfo />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular accounts (newest first) */}
              {regularItems.length > 0 && (
                <div>
                  {priorityItems.length > 0 && (
                    <ScrollReveal direction="left" className="mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <h3 className="text-base font-semibold text-slate-500 uppercase tracking-wide">
                          Tài Khoản Mới Đăng
                        </h3>
                      </div>
                    </ScrollReveal>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:items-stretch">
                    {regularItems.map((account, i) => (
                      <ScrollReveal
                        key={account.id}
                        delay={i < 6 ? i * 60 : 0}
                        distance="sm"
                        className="h-full min-h-0"
                      >
                        <AccountCard
                          account={account}
                          priority={priorityItems.length === 0 && i < 3}
                          hideSellerInfo
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sold Accounts */}
        {soldItems.length > 0 && (
          <section className="border-t border-slate-200 bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
              <ScrollReveal direction="left" className="mb-6 sm:mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Đã Giao Dịch Thành Công
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
                    Tài Khoản Đã Bán
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {soldItems.length} giao dịch thành công tại Sạp Acc eFootball
                  </p>
                </div>
              </ScrollReveal>
              <AutoScrollSlider>
                  {soldItems.map((account, i) => (
                    <div
                      key={account.id}
                      className="w-[85vw] max-w-[320px] shrink-0 snap-start sm:w-[340px] lg:w-[380px]"
                    >
                      <ScrollReveal delay={i * 80} distance="sm">
                        <AccountCard account={account} hideSellerInfo />
                      </ScrollReveal>
                    </div>
                  ))}
              </AutoScrollSlider>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
