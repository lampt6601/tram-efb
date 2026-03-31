import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { AccountCard } from "@/components/storefront/AccountCard";
import { AutoScrollSlider } from "@/components/ui/AutoScrollSlider";
import {
  User,
  BadgeCheck,
  ShoppingBag,
  CheckCircle2,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SellerShopContact } from "@/components/storefront/SellerShopContact";
import { CollateralBadge } from "@/components/storefront/CollateralBadge";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicAccount } from "@/types/database";

export const revalidate = 300; // 5 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const sellerName = decodeURIComponent(name);

  return {
    title: `Gian hàng ${sellerName} | THC eFootball Shop`,
    description: `Xem tất cả tài khoản eFootball đang bán và đã bán của ${sellerName} tại THC eFootball Shop.`,
  };
}

export default async function SellerShopPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const sellerName = decodeURIComponent(name);
  const supabase = createSupabaseAnonClient();

  const cardFields = "id, title, selling_price, original_price, primary_image_url, images, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, server_region, created_at, seller_full_name, seller_avatar_url, seller_transaction_box_url, seller_collateral_amount, seller_sold_count";

  const [{ data: availableRaw }, { data: soldRaw }] = await Promise.all([
    supabase
      .from("public_accounts")
      .select(cardFields)
      .eq("seller_full_name", sellerName)
      .order("is_priority", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("public_sold_accounts")
      .select(cardFields)
      .eq("seller_full_name", sellerName)
      .order("created_at", { ascending: false }),
  ]);

  const available = (availableRaw ?? []) as PublicAccount[];
  const sold = (soldRaw ?? []) as PublicAccount[];

  // If no accounts at all, this seller doesn't exist
  if (available.length === 0 && sold.length === 0) notFound();

  // Get seller info from the first available account, or first sold
  const sample = available[0] ?? sold[0];
  const seller = {
    name: sample.seller_full_name ?? sellerName,
    avatar: sample.seller_avatar_url,
    transactionBoxUrl: sample.seller_transaction_box_url,
    collateralAmount: Number(sample.seller_collateral_amount) || 0,
    soldCount: sample.seller_sold_count ?? sold.length,
  };

  const contactBase = `/api/contact/seller/${encodeURIComponent(seller.name)}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        {/* Hero — Seller profile */}
        <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/50">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" /> Về trang chủ
            </Link>

            <div className="flex items-start gap-4">
              {/* Avatar */}
              {seller.avatar ? (
                <Image
                  src={seller.avatar}
                  alt={seller.name}
                  width={80}
                  height={80}
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-md sm:h-20 sm:w-20"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 shadow-md sm:h-20 sm:w-20 dark:bg-indigo-500/20">
                  <User className="h-7 w-7 text-indigo-500 sm:h-9 sm:w-9" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
                  {seller.name}
                </h1>

                {/* Stats */}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                    <ShoppingBag className="h-3 w-3" />
                    {available.length} đang bán
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {seller.soldCount} đã bán
                  </span>
                  {seller.soldCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                      <BadgeCheck className="h-3 w-3" />
                      Đã xác minh
                    </span>
                  )}
                  {seller.collateralAmount > 0 && (
                    <CollateralBadge amount={seller.collateralAmount} />
                  )}
                </div>

                {/* Contact buttons */}
                <SellerShopContact
                  transactionBoxUrl={seller.transactionBoxUrl ? `${contactBase}?type=transaction_box` : undefined}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Available accounts */}
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {available.length > 0 ? (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Đang Bán ({available.length})
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
              <Gamepad2 className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Chưa có tài khoản đang bán
              </p>
            </div>
          )}

          {/* Sold accounts — auto-scroll slider */}
          {sold.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Đã Bán ({sold.length})
                </h2>
              </div>
              <AutoScrollSlider>
                {sold.map((account) => (
                  <div
                    key={account.id}
                    className="w-[85vw] max-w-[320px] shrink-0 snap-start sm:w-[340px]"
                  >
                    <AccountCard account={account} />
                  </div>
                ))}
              </AutoScrollSlider>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
