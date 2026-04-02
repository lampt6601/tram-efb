import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { OwnerSection } from "@/components/storefront/OwnerSection";
import { AccountCard } from "@/components/storefront/AccountCard";
import { AccountFilters } from "@/components/storefront/AccountFilters";
import { StatsBar } from "@/components/storefront/StatsBar";
import { ZaloNotify } from "@/components/storefront/ZaloNotify";
import { ScrollReveal } from '@thc-efb/ui/scroll-reveal';
import { AutoScrollSlider } from '@thc-efb/ui/auto-scroll-slider';
import Link from "next/link";
import { Gamepad2, Search, BadgeCheck, Flame, Clock, ShieldCheck, CircleCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import { RecruitHeroCTA } from "@/components/storefront/RecruitHeroCTA";
import { RecruitAdminSection } from "@/components/storefront/RecruitAdminSection";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { PublicAccount } from '@thc-efb/supabase/types';
import { FiltersSkeleton } from "@/components/storefront/AccountCardSkeleton";

export const revalidate = 60; // 1 minute — balances freshness with bandwidth

export const metadata: Metadata = {
  title:
    "Shop Acc eFootball Mobile Uy Tín | Mua Bán Tài Khoản eFootball Giá Rẻ",
  description:
    "Shop acc eFootball mobile uy tín #1 Việt Nam. Mua bán acc eFootball giá rẻ, acc clone chất lượng cao. Giao dịch an toàn, bảo hành đổi trả, cập nhật acc mới mỗi ngày. 160+ giao dịch thành công.",
  alternates: {
    canonical: "https://thc-efb.com",
  },
  openGraph: {
    title:
      "Shop Acc eFootball Mobile Uy Tín | Mua Bán Tài Khoản - THC EFB",
    description:
      "Mua bán acc eFootball mobile giá rẻ, uy tín. 160+ giao dịch thành công. Acc clone chất lượng, giao dịch an toàn, bảo hành đổi trả.",
    url: "/",
    images: [
      {
        url: "/thc-shop.png",
        width: 1200,
        height: 630,
        alt: "THC eFootball Shop - Shop Acc eFootball Mobile Uy Tín",
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
                <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 py-1 pl-1 pr-3 sm:mb-5 sm:gap-2.5 sm:py-1.5 sm:pl-1.5 sm:pr-4 lg:mx-0">
                  <Image
                    src="/avatar-owner.jpeg"
                    alt="Trần Hữu Cảnh"
                    width={28}
                    height={28}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-indigo-400/50 sm:h-7 sm:w-7"
                    priority
                  />
                  <span className="text-[11px] font-semibold tracking-wide text-indigo-300 sm:text-xs">
                    Sàn của <span className="text-white">Trần Hữu Cảnh</span>
                  </span>
                  <BadgeCheck className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />
                </div>
                <h1 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Sàn Giao Dịch{" "}
                  <span className="block text-indigo-400">
                    Tài Khoản eFootball
                  </span>
                </h1>
                <p className="mx-auto mt-2 text-xs text-slate-400 sm:mt-3 sm:text-base lg:mx-0">
                  Mua bán tài khoản eFootball an toàn, giá hợp lý.
                </p>
                <div className="mx-auto mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 sm:mt-3 lg:mx-0 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                    Chủ sàn duyệt trước khi đăng
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Giao dịch an toàn qua trung gian chủ sàn
                  </span>
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
                        <AccountCard account={account} priority={i < 3} />
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
                        <AccountCard account={account} priority={priorityItems.length === 0 && i < 3} />
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
                    {soldItems.length} giao dịch thành công — minh chứng uy tín
                    của sàn
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
                        <AccountCard account={account} />
                      </ScrollReveal>
                    </div>
                  ))}
              </AutoScrollSlider>
            </div>
          </section>
        )}
      </main>

      {/* Zalo notification CTA */}
      <section className="border-t border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
          <ZaloNotify />
        </div>
      </section>

      {/* Bảo kê trust banner */}
      <section className="border-t border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/bao-ke"
            className="flex items-center justify-between gap-4 py-3.5 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Người Bán Được Bảo Kê
                </span>
                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
                  Ký quỹ minh bạch · Giao dịch an toàn
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-emerald-400" />
          </Link>
        </div>
      </section>

      <RecruitAdminSection />
      <OwnerSection />
      <Footer />
    </div>
  );
}
