import { createSupabaseAnonClient } from "@/lib/supabase-anon";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { StatusBadge } from "@/components/ui/Badge";
import { ImageGallery } from "@/components/ui/ImageGallery";
import {
  formatCurrency,
  formatNumber,
  CONTACT_ZALO_URL,
  CONTACT_ZALO_GROUP_URL,
  CONTACT_MESSENGER_URL as CONTACT_FACEBOOK_URL,
} from "@/lib/constants";
import {
  ArrowLeft,
  Zap,
  Coins,
  Shield,
  MessageCircle,
  CheckCircle2,
  Star,
  ExternalLink,
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

  // Try public first, fallback to sold
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

    // Fetch reviews for sold account
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

            <div className="overflow-hidden shadow-sm sm:rounded-xl">
              <div className="grid max-w-full grid-cols-1 gap-6 p-4">
                {/* Images — greyed out; min-w-0 + max-w-full for iOS Safari */}
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
                      <h1 className="text-2xl font-bold text-slate-700 line-through decoration-slate-400 dark:text-slate-300 dark:decoration-slate-500 lg:text-3xl">
                        {account.title}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        {account.server_region && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            Server: {account.server_region}
                          </span>
                        )}
                        {account.monthly_log_quota != null && (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                            Số lượng log: {account.monthly_log_quota}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status="Sold" />
                  </div>

                  {/* Sold banner */}
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Tài khoản đã được bán
                      </p>
                      <p className="mt-0.5 text-sm text-emerald-600 dark:text-emerald-400">
                        Tài khoản này đã có chủ. Khám phá các tài khoản khác
                        đang sẵn sàng ngay bên dưới!
                      </p>
                    </div>
                  </div>

                  {Boolean(
                    (account.total_gp ?? 0) > 0 ||
                    (account.total_coins_android ?? 0) > 0 ||
                    (account.total_coins_ios ?? 0) > 0 ||
                    (account.team_strength ?? 0) > 0,
                  ) && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(account.total_gp ?? 0) > 0 && (
                        <div className="rounded-xl bg-amber-50 p-4 text-center opacity-60 dark:bg-amber-500/10">
                          <Zap className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(account.total_gp)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Tổng GP</p>
                        </div>
                      )}
                      {((account.total_coins_android ?? 0) > 0 ||
                        (account.total_coins_ios ?? 0) > 0) && (
                        <div className="rounded-xl bg-yellow-50 p-4 text-center opacity-60 dark:bg-yellow-500/10">
                          <Coins className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
                            {(account.total_coins_android ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5">
                                <AndroidCoinIcon
                                  size={18}
                                  className="opacity-80"
                                />
                                {formatNumber(account.total_coins_android)}
                              </span>
                            )}
                            {(account.total_coins_android ?? 0) > 0 &&
                              (account.total_coins_ios ?? 0) > 0 && (
                                <span className="text-slate-400 dark:text-slate-500">|</span>
                              )}
                            {(account.total_coins_ios ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5">
                                <IosCoinIcon size={18} className="opacity-80" />
                                {formatNumber(account.total_coins_ios)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Coins</p>
                        </div>
                      )}
                      {(account.team_strength ?? 0) > 0 && (
                        <div className="rounded-xl bg-blue-50 p-4 text-center opacity-60 dark:bg-blue-500/10">
                          <Shield className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {account.team_strength}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Lực Chiến</p>
                        </div>
                      )}
                      <div className="rounded-xl bg-indigo-50 p-4 text-center opacity-60 dark:bg-indigo-500/10">
                        <MessageCircle className="mx-auto mb-1 h-5 w-5 text-indigo-500" />
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {account.monthly_log_quota ?? 10}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Số lượng log</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-8">
                    <div className="mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Giá Đã Bán</p>
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
            <ReviewSection accountId={id} reviews={reviews} isSold={true} />

            {/* Related accounts */}
            <RelatedAccounts
              currentAccountId={id}
              currentPrice={account.selling_price}
              onlyAvailable
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No reviews for available accounts (reviews are only for sold accounts)

  // Normal available/pending account
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl overflow-x-hidden px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
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

          <div className="grid min-w-0 max-w-full grid-cols-1 gap-6">
            {/* Left — Images: min-w-0 + max-w-full for iOS Safari (aspect-ratio in grid is buggy) */}
            <div className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              <ImageGallery images={galleryImages} title={account.title} />
            </div>

            {/* Right — Info card */}
            <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-5 shadow-sm sm:p-6 dark:bg-slate-800">
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

              {/* Description */}
              {account.description && (
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {account.description}
                  </p>
                </div>
              )}

              {/* Stats grid */}
              {Boolean(
                (account.total_gp ?? 0) > 0 ||
                (account.total_coins_android ?? 0) > 0 ||
                (account.total_coins_ios ?? 0) > 0 ||
                (account.team_strength ?? 0) > 0 ||
                account.monthly_log_quota != null,
              ) && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(account.total_gp ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600/70 dark:text-amber-400/70">Tổng GP</p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(account.total_gp)}</p>
                      </div>
                    </div>
                  )}
                  {(account.total_coins_android ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <AndroidCoinIcon size={16} className="shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/70">Coins Android</p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(account.total_coins_android)}</p>
                      </div>
                    </div>
                  )}
                  {(account.total_coins_ios ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2.5 dark:border-teal-500/20 dark:bg-teal-500/10">
                      <IosCoinIcon size={16} className="shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-teal-600/70 dark:text-teal-400/70">Coins iOS</p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(account.total_coins_ios)}</p>
                      </div>
                    </div>
                  )}
                  {(account.team_strength ?? 0) > 0 && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <Shield className="h-4 w-4 shrink-0 text-blue-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-blue-600/70 dark:text-blue-400/70">Lực Chiến</p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{account.team_strength}</p>
                      </div>
                    </div>
                  )}
                  {account.monthly_log_quota != null && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                      <MessageCircle className="h-4 w-4 shrink-0 text-indigo-500" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-600/70 dark:text-indigo-400/70">Số lượng log</p>
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{account.monthly_log_quota}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="my-5 border-t border-slate-100 dark:border-slate-700" />

              {/* Price */}
              <div className="mb-4">
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

              {/* Contact (owner shop) */}
              <div className="mb-3 flex items-start gap-3">
                <div className="relative shrink-0">
                  <Image
                    src="/avatar-owner.jpeg"
                    alt="Chủ shop"
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                    priority
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow dark:border-slate-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Nhắn ngay với chủ shop để chốt acc này!
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Liên hệ trực tiếp với chủ shop qua Zalo hoặc Facebook — tư
                    vấn nhanh, giao dịch uy tín.
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Trần Hữu Cảnh · THC eFootball Shop
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`${CONTACT_ZALO_URL}?text=${contactMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Image
                    src={zaloIcon}
                    alt="Zalo"
                    className="h-5 w-5 object-contain"
                  />
                  <span className="hidden sm:inline">Nhắn qua</span> Zalo
                </a>
                <a
                  href={CONTACT_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <Image
                    src={facebookIcon}
                    alt="Facebook"
                    className="h-5 w-5 object-contain"
                  />
                  <span className="hidden sm:inline">Nhắn qua</span> Facebook
                </a>
              </div>

              {/* Group fallback notice */}
              <a
                href={CONTACT_ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/20"
              >
                <div className="mt-0.5 shrink-0">
                  <Image
                    src={zaloIcon}
                    alt="Zalo Group"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Chủ shop chưa rep? Vào đây để được hỗ trợ ngay!
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    Tham gia Group Zalo — có admin và cộng đồng sẵn sàng hỗ trợ bạn 24/7.
                  </p>
                </div>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 transition-colors group-hover:text-amber-600 dark:text-amber-500 dark:group-hover:text-amber-300" />
              </a>
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
                  ...(account.team_strength ? [{ "@type": "PropertyValue", name: "Team Strength", value: account.team_strength }] : []),
                  ...(account.total_gp ? [{ "@type": "PropertyValue", name: "Total GP", value: account.total_gp }] : []),
                  ...(account.server_region ? [{ "@type": "PropertyValue", name: "Server Region", value: account.server_region }] : []),
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
      <Footer />
    </div>
  );
}
