import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { StatusBadge } from "@/components/ui/Badge";
import { ImageGallery } from "@/components/ui/ImageGallery";
import {
  formatCurrency,
  formatNumber,
  CONTACT_ZALO_GROUP_URL,
} from "@/lib/constants";
import {
  ArrowLeft,
  Zap,
  Coins,
  Shield,
  MessageCircle,
  CheckCircle2,
  Star,
  ShieldCheck,
  User,
  BadgeCheck,
  ShieldAlert,
  Award,
  Store,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import facebookIcon from "@/assets/icons/facebook.webp";
import zaloIcon from "@/assets/icons/zalo.png";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicAccount, PublicReview } from "@/types/database";
import { ogImage } from "@/lib/image-utils";
import { ReviewSection } from "@/components/storefront/ReviewSection";
import { RelatedAccounts } from "@/components/storefront/RelatedAccounts";
import { ShareButtons } from "@/components/storefront/ShareButtons";
import { BuyNowBottomBar } from "@/components/storefront/BuyNowBottomBar";
import {
  AndroidCoinIcon,
  IosCoinIcon,
} from "@/components/ui/PlatformCoinIcons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createSupabaseAnonClient();

  const { data: pub } = await supabase
    .from("public_accounts")
    .select("title, selling_price, primary_image_url, status")
    .eq("id", id)
    .single();

  const { data: sold } = !pub
    ? await supabase
        .from("public_sold_accounts")
        .select("title, selling_price, primary_image_url, status")
        .eq("id", id)
        .single()
    : { data: null };

  const account = pub ?? sold;
  if (!account) return {};

  const isSold = account.status === "Sold";
  const title = isSold ? `[Đã Bán] ${account.title}` : account.title;
  const description = isSold
    ? `Tài khoản ${account.title} đã được bán. Xem các tài khoản khác đang sẵn sàng tại THC eFootball Shop.`
    : `Mua ngay tài khoản ${account.title} với giá ${formatCurrency(account.selling_price)}. Giao dịch nhanh, uy tín tại THC eFootball Shop.`;
  const image = account.primary_image_url
    ? ogImage(account.primary_image_url)
    : undefined;

  return {
    title,
    description,
    robots: isSold
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `/accounts/${id}`,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: account.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAnonClient();

  // Try public_accounts view first (Available/Pending)
  const { data: publicData } = await supabase
    .from("public_accounts")
    .select("*")
    .eq("id", id)
    .single();

  // Fallback: check if it's a sold account
  if (!publicData) {
    const { data: soldData } = await supabase
      .from("public_sold_accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (!soldData) notFound();

    const { data: reviewsData } = await supabase
      .from("public_reviews")
      .select("*")
      .eq("account_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    const reviews = (reviewsData ?? []) as PublicReview[];

    const account = soldData as PublicAccount;
    const galleryImages = account.primary_image_url
      ? [
          account.primary_image_url,
          ...(account.images?.filter(
            (img) => img !== account.primary_image_url,
          ) || []),
        ]
      : account.images || [];

    // ── SOLD ACCOUNT PAGE ──────────────────────────────────────────────
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-4xl overflow-x-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-4 px-4 sm:mb-6 sm:px-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại Cửa Hàng
              </Link>
            </div>

            {/* Sold banner — prominent */}
            <div className="mx-4 mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 sm:mx-0 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Tài khoản đã được bán
                </p>
                <p className="mt-0.5 text-sm text-emerald-600 dark:text-emerald-400">
                  Tài khoản này đã có chủ. Khám phá các tài khoản khác đang sẵn
                  sàng ngay bên dưới!
                </p>
              </div>
            </div>

            {/* Related accounts — pushed up for sold page */}
            <div className="px-4 sm:px-0">
              <RelatedAccounts
                currentAccountId={id}
                currentPrice={account.selling_price}
                onlyAvailable
              />
            </div>

            {/* Collapsed account details */}
            <div className="mt-8 overflow-hidden px-4 shadow-sm sm:rounded-xl sm:px-0">
              <div className="grid max-w-full grid-cols-1 gap-6 p-4">
                {/* Images — greyed out */}
                <div className="relative min-w-0 max-w-full overflow-hidden">
                  <div className="pointer-events-none opacity-60 grayscale">
                    <ImageGallery
                      images={galleryImages}
                      title={account.title}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-2xl font-bold text-slate-700 line-through decoration-slate-400 lg:text-3xl dark:text-slate-300 dark:decoration-slate-500">
                        {account.title}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        {account.server_region && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            Server: {account.server_region}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status="Sold" />
                  </div>

                  <div className="mt-auto pt-8">
                    <div className="mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Giá Đã Bán
                      </p>
                      <p className="text-3xl font-extrabold text-slate-400 line-through decoration-slate-300 dark:text-slate-500 dark:decoration-slate-600">
                        {formatCurrency(account.selling_price)}
                      </p>
                    </div>

                    <Link
                      href="/"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      Xem Tài Khoản Khác
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="px-4 sm:px-0">
              <ReviewSection
                accountId={id}
                reviews={reviews}
                isSold={true}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── AVAILABLE ACCOUNT PAGE ─────────────────────────────────────────────
  // Total sold count for trust badge
  const { count: totalSoldCount } = await supabase
    .from("public_sold_accounts")
    .select("id", { count: "exact", head: true });

  const account = publicData as PublicAccount;
  const isSale = account.original_price
    ? account.original_price > account.selling_price
    : false;
  const discount = isSale
    ? Math.round(
        ((account.original_price! - account.selling_price) /
          account.original_price!) *
          100,
      )
    : 0;
  const contactMessage = encodeURIComponent(
    `Chào chủ shop, mình quan tâm tài khoản ${account.title} (ID: ${account.id}).`,
  );

  const galleryImages = account.primary_image_url
    ? [
        account.primary_image_url,
        ...(account.images?.filter(
          (img) => img !== account.primary_image_url,
        ) || []),
      ]
    : account.images || [];

  const hasStats =
    (account.total_gp ?? 0) > 0 ||
    (account.total_coins_android ?? 0) > 0 ||
    (account.total_coins_ios ?? 0) > 0 ||
    (account.team_strength ?? 0) > 0 ||
    account.monthly_log_quota != null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          {/* Back link + Share */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại Cửa Hàng
            </Link>
            <ShareButtons accountId={id} />
          </div>

          {/* ── 2-column layout on desktop ── */}
          <div className="grid min-w-0 max-w-full grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left — Images */}
            <div className="relative min-w-0 max-w-full overflow-hidden rounded-2xl bg-white shadow-sm lg:col-span-3 dark:bg-slate-800">
              {/* Sale ribbon */}
              {isSale && (
                <div className="absolute left-3 top-3 z-10 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  GIẢM {discount}%
                </div>
              )}
              <ImageGallery images={galleryImages} title={account.title} />
            </div>

            {/* Right — Info card (sticky on desktop) */}
            <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:col-span-2 lg:sticky lg:top-4 lg:self-start dark:bg-slate-800">
              {/* Title */}
              <h1 className="flex items-start gap-2 text-xl font-bold leading-snug text-slate-900 sm:text-2xl dark:text-slate-100">
                <span>{account.title}</span>
                {account.is_priority && (
                  <Star className="mt-0.5 h-5 w-5 shrink-0 fill-amber-500 text-amber-500" />
                )}
              </h1>

              {/* Tags */}
              {account.server_region && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    Server: {account.server_region}
                  </span>
                </div>
              )}

              {/* Price — moved up */}
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Giá Bán
                </p>
                <div className="mt-1 flex items-end gap-3">
                  <p
                    className={`text-3xl font-extrabold ${isSale ? "text-rose-600 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400"}`}
                  >
                    {formatCurrency(account.selling_price)}
                  </p>
                  {isSale && (
                    <div className="mb-0.5 flex flex-col">
                      <span className="text-sm font-medium text-slate-400 line-through dark:text-slate-500">
                        {formatCurrency(account.original_price!)}
                      </span>
                      <span className="inline-flex w-fit items-center rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                        -{discount}% GIẢM
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Divider */}
              <div className="my-4 border-t border-slate-100 dark:border-slate-700" />

              {/* Description */}
              {account.description && (
                <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {account.description}
                  </p>
                </div>
              )}

              {/* Stats grid */}
              {hasStats && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {(account.total_gp ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600/70 dark:text-amber-400/70">
                          Tổng GP
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {formatNumber(account.total_gp)}
                        </p>
                      </div>
                    </div>
                  )}
                  {(account.total_coins_android ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <AndroidCoinIcon size={16} className="shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/70">
                          Coins Android
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {formatNumber(account.total_coins_android)}
                        </p>
                      </div>
                    </div>
                  )}
                  {(account.total_coins_ios ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2.5 dark:border-teal-500/20 dark:bg-teal-500/10">
                      <IosCoinIcon size={16} className="shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-teal-600/70 dark:text-teal-400/70">
                          Coins iOS
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {formatNumber(account.total_coins_ios)}
                        </p>
                      </div>
                    </div>
                  )}
                  {(account.team_strength ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <Shield className="h-4 w-4 shrink-0 text-blue-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-blue-600/70 dark:text-blue-400/70">
                          Lực Chiến
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {account.team_strength}
                        </p>
                      </div>
                    </div>
                  )}
                  {account.monthly_log_quota != null && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                      <MessageCircle className="h-4 w-4 shrink-0 text-indigo-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-600/70 dark:text-indigo-400/70">
                          Số lượng log
                        </p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                          {account.monthly_log_quota}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seller info */}
              {account.seller_display_name && (
                <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {account.seller_avatar_url ? (
                        <Image
                          src={account.seller_avatar_url}
                          alt={account.seller_display_name}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm dark:bg-indigo-500/20">
                          <User className="h-5 w-5 text-indigo-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Người bán
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {account.seller_display_name}
                        </p>
                        {(account.seller_sold_count ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <BadgeCheck className="h-3 w-3" />
                            Đã bán {account.seller_sold_count} acc
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact links — via API redirect to hide raw URLs */}
                  {(account.seller_zalo_link || account.seller_facebook_link) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {account.seller_zalo_link && (
                        <a
                          href={`/api/contact/${id}?type=zalo`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:bg-white dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                        >
                          <Image
                            src={zaloIcon}
                            alt="Zalo"
                            className="h-3.5 w-3.5 object-contain"
                          />
                          Zalo
                        </a>
                      )}
                      {account.seller_facebook_link && (
                        <a
                          href={`/api/contact/${id}?type=facebook`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-indigo-700 shadow-sm transition-colors hover:bg-white dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
                        >
                          <Image
                            src={facebookIcon}
                            alt="Facebook"
                            className="h-3.5 w-3.5 object-contain"
                          />
                          Facebook
                        </a>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/shop/${encodeURIComponent(account.seller_display_name)}`}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white/60 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-white dark:border-indigo-500/20 dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:bg-slate-700"
                  >
                    <Store className="h-3.5 w-3.5" />
                    Xem gian hàng ({account.seller_sold_count ?? 0} acc đã bán)
                  </Link>
                  <p className="mt-2 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                    * Giao dịch qua chủ shop để được hỗ trợ. Chủ shop không chịu trách nhiệm với giao dịch không thông qua chủ shop.
                  </p>
                </div>
              )}

              {/* Shop owner — intermediary */}
              <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Image
                      src="/avatar-owner.jpeg"
                      alt="Chủ shop"
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                      priority
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow dark:border-slate-800">
                      <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Chủ Shop · Trung Gian Uy Tín
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Trần Hữu Cảnh
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Liên hệ chủ shop làm trung gian để đảm bảo an toàn giao
                      dịch.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`/api/contact/owner?type=zalo&text=${contactMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:bg-white dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                      >
                        <Image
                          src={zaloIcon}
                          alt="Zalo"
                          className="h-3.5 w-3.5 object-contain"
                        />
                        Zalo
                      </a>
                      <a
                        href="/api/contact/owner?type=facebook"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm transition-colors hover:bg-white dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
                      >
                        <Image
                          src={facebookIcon}
                          alt="Facebook"
                          className="h-3.5 w-3.5 object-contain"
                        />
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related accounts */}
          <RelatedAccounts
            currentAccountId={id}
            currentPrice={account.selling_price}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: account.title,
                image: galleryImages,
                description: `Mua acc eFootball ${account.server_region ? `server ${account.server_region}` : ""} với lực chiến ${account.team_strength ?? 0}, tổng GP ${account.total_gp ?? 0}. Giao dịch uy tín tại THC eFootball Shop.`,
                sku: account.id,
                brand: {
                  "@type": "Brand",
                  name: "eFootball",
                },
                category: "Game Accounts",
                offers: {
                  "@type": "Offer",
                  priceCurrency: "VND",
                  price: account.selling_price,
                  availability: "https://schema.org/InStock",
                  url: `https://thc-efb.com/accounts/${account.id}`,
                  seller: {
                    "@type": "Organization",
                    name: "THC eFootball Shop",
                    url: "https://thc-efb.com",
                  },
                },
                additionalProperty: [
                  ...(account.team_strength
                    ? [
                        {
                          "@type": "PropertyValue",
                          name: "Team Strength",
                          value: account.team_strength,
                        },
                      ]
                    : []),
                  ...(account.total_gp
                    ? [
                        {
                          "@type": "PropertyValue",
                          name: "Total GP",
                          value: account.total_gp,
                        },
                      ]
                    : []),
                  ...(account.server_region
                    ? [
                        {
                          "@type": "PropertyValue",
                          name: "Server Region",
                          value: account.server_region,
                        },
                      ]
                    : []),
                ],
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Trang chủ",
                    item: "https://thc-efb.com",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: account.title,
                    item: `https://thc-efb.com/accounts/${account.id}`,
                  },
                ],
              }),
            }}
          />
        </div>
      </main>

      {/* ── Sticky mobile CTA bar + popup ── */}
      <BuyNowBottomBar
        formattedPrice={formatCurrency(account.selling_price)}
        isSale={isSale}
        contactMessage={contactMessage}
        ownerZaloUrl="/api/contact/owner"
        ownerFacebookUrl="/api/contact/owner?type=facebook"
        seller={
          account.seller_display_name
            ? {
                name: account.seller_display_name,
                avatarUrl: account.seller_avatar_url ?? undefined,
                zaloLink: account.seller_zalo_link ? `/api/contact/${id}?type=zalo` : undefined,
                facebookLink: account.seller_facebook_link ? `/api/contact/${id}?type=facebook` : undefined,
                soldCount: account.seller_sold_count ?? undefined,
              }
            : undefined
        }
        zaloGroupUrl={CONTACT_ZALO_GROUP_URL}
        zaloBoxUrl="https://zalo.me/g/umniisdttnw5kcubv74y"
        totalSoldCount={totalSoldCount ?? 0}
      />

      <Footer />
    </div>
  );
}
