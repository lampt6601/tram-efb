import { createSupabaseAnonClient } from '@thc-efb/supabase/anon';
import { Header } from "@/components/storefront/Header";
import { BackButton } from '@thc-efb/ui/back-button';
import Link from "next/link";
import { Footer } from "@/components/storefront/Footer";
import { StatusBadge } from '@thc-efb/ui/badge';
import { ImageGallery } from '@thc-efb/ui/image-gallery';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
} from '@thc-efb/shared/constants';
import {
  ArrowLeft,
  Zap,
  Shield,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicAccount } from '@thc-efb/supabase/types';
import { ogImage } from '@thc-efb/shared/image-utils';
import { RelatedAccounts } from "@/components/storefront/RelatedAccounts";
import { ShareButtons } from "@/components/storefront/ShareButtons";
import {
  AndroidCoinIcon,
  IosCoinIcon,
} from '@thc-efb/ui/platform-coin-icons';

export const revalidate = 3600; // 1 hour — revalidated on account update via revalidatePath

export async function generateStaticParams() {
  const supabase = createSupabaseAnonClient();

  const [{ data: available }, { data: sold }] = await Promise.all([
    supabase.from("public_accounts").select("id"),
    supabase.from("public_sold_accounts").select("id"),
  ]);

  const ids = [
    ...(available ?? []).map((r) => r.id),
    ...(sold ?? []).map((r) => r.id),
  ];

  return ids.map((id) => ({ id: String(id) }));
}

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
  const isDepositedMeta = account.status === "Deposited";
  const title = isSold
    ? `[Đã Bán] ${account.title}`
    : isDepositedMeta
      ? `[Đang Cọc] ${account.title}`
      : account.title;
  const description = isSold
    ? `Tài khoản ${account.title} đã được bán. Xem các tài khoản khác đang sẵn sàng tại Sạp Acc eFootball.`
    : isDepositedMeta
      ? `Tài khoản ${account.title} đang được cọc. Xem các tài khoản khác đang sẵn sàng tại Sạp Acc eFootball.`
      : `Khám phá tài khoản ${account.title} tại Sạp Acc eFootball với giá ${formatCurrency(account.selling_price)}.`;
  const image = account.primary_image_url
    ? ogImage(account.primary_image_url)
    : undefined;

  return {
    title,
    description,
    robots: isSold
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: !isSold
      ? { canonical: `https://sap-efb.vercel.app/accounts/${id}` }
      : undefined,
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
  const accountFields = "id, title, description, selling_price, original_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, is_priority, is_clone, server_region, monthly_log_quota, created_at, seller_full_name, seller_avatar_url, seller_transaction_box_url, seller_collateral_amount, seller_sold_count";

  const { data: publicData } = await supabase
    .from("public_accounts")
    .select(accountFields)
    .eq("id", id)
    .single();

  // Fallback: check if it's a sold account
  if (!publicData) {
    const { data: soldData } = await supabase
      .from("public_sold_accounts")
      .select(accountFields)
      .eq("id", id)
      .single();

    if (!soldData) notFound();

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
              <BackButton
                fallbackHref="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại Cửa Hàng
              </BackButton>
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
                        {formatCompactCurrency(account.selling_price)}
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

          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── AVAILABLE / DEPOSITED ACCOUNT PAGE ──────────────────────────────────
  const account = publicData as PublicAccount;
  const isDeposited = account.status === "Deposited";
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
  const contactBoxUrl = "https://zalo.me/g/pmpbi2qosaovor0ez3ys";

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
    (account.team_strength ?? 0) > 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-3 py-2 sm:px-6 sm:py-8 lg:px-8">
          {/* Back link + Share */}
          <div className="mb-2 flex items-center justify-between sm:mb-4">
            <BackButton
              fallbackHref="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại Cửa Hàng
            </BackButton>
            <ShareButtons accountId={id} />
          </div>

          {/* ── 2-column layout on desktop ── */}
          <div className="grid min-w-0 max-w-full grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-5">
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
            <div className="min-w-0 overflow-hidden rounded-2xl bg-white p-3.5 shadow-sm sm:p-6 lg:col-span-2 lg:sticky lg:top-4 lg:self-start dark:bg-slate-800">
              {/* Title */}
              <div className="flex items-start gap-2">
                <h1 className="text-lg font-bold leading-snug text-slate-900 sm:text-2xl dark:text-slate-100">
                  {account.title}
                </h1>
                {account.is_priority && (
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                    ★ Nổi Bật
                  </span>
                )}
              </div>

              {/* Tags */}
              {(account.server_region || account.monthly_log_quota != null) && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {account.server_region && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Server: {account.server_region}
                    </span>
                  )}
                  {account.monthly_log_quota != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                      <MessageCircle className="h-3 w-3" />
                      Log: {account.monthly_log_quota}
                    </span>
                  )}
                </div>
              )}

              {/* Price + contact box */}
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <p
                      className={`text-2xl font-extrabold sm:text-3xl ${isSale ? "text-rose-600 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400"}`}
                    >
                      {formatCompactCurrency(account.selling_price)}
                    </p>
                    {isSale && (
                      <span className="text-sm font-medium text-slate-400 line-through dark:text-slate-500">
                        {formatCompactCurrency(account.original_price!)}
                      </span>
                    )}
                  </div>
                  {isDeposited ? (
                    <span className="shrink-0 rounded-xl bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                      Đang được cọc
                    </span>
                  ) : (
                    <a
                      href={contactBoxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
                    >
                      Liên hệ qua Box
                    </a>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-slate-100 sm:my-4 dark:border-slate-700" />

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
                <div className="mb-3 grid grid-cols-2 gap-1 sm:mb-4 sm:gap-2">
                  {(account.total_gp ?? 0) > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-2 py-1.5 sm:rounded-xl sm:px-3 sm:py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500 sm:h-4 sm:w-4" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-amber-600/70 sm:text-[10px] dark:text-amber-400/70">
                          Tổng GP
                        </p>
                        <p className="truncate text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                          {formatNumber(account.total_gp)}
                        </p>
                      </div>
                    </div>
                  )}
                  {(account.total_coins_android ?? 0) > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1.5 sm:rounded-xl sm:px-3 sm:py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <AndroidCoinIcon size={14} className="shrink-0 sm:hidden" />
                      <AndroidCoinIcon size={16} className="hidden shrink-0 sm:block" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-emerald-600/70 sm:text-[10px] dark:text-emerald-400/70">
                          Coins Android
                        </p>
                        <p className="truncate text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                          {formatNumber(account.total_coins_android)}
                        </p>
                      </div>
                    </div>
                  )}
                  {(account.total_coins_ios ?? 0) > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-2 py-1.5 sm:rounded-xl sm:px-3 sm:py-2.5 dark:border-teal-500/20 dark:bg-teal-500/10">
                      <IosCoinIcon size={14} className="shrink-0 sm:hidden" />
                      <IosCoinIcon size={16} className="hidden shrink-0 sm:block" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-teal-600/70 sm:text-[10px] dark:text-teal-400/70">
                          Coins iOS
                        </p>
                        <p className="truncate text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                          {formatNumber(account.total_coins_ios)}
                        </p>
                      </div>
                    </div>
                  )}
                  {(account.team_strength ?? 0) > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1.5 sm:rounded-xl sm:px-3 sm:py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                      <Shield className="h-3.5 w-3.5 shrink-0 text-blue-500 sm:h-4 sm:w-4" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-blue-600/70 sm:text-[10px] dark:text-blue-400/70">
                          Lực Chiến
                        </p>
                        <p className="truncate text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
                          {account.team_strength}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Related accounts */}
          <RelatedAccounts
            currentAccountId={id}
            currentPrice={account.selling_price}
          />

          {!isSale && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: account.title,
                  image: galleryImages,
                  description: `Tài khoản eFootball ${account.server_region ? `server ${account.server_region}` : ""} với lực chiến ${account.team_strength ?? 0}, tổng GP ${account.total_gp ?? 0}.`,
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
                    availability: isDeposited
                      ? "https://schema.org/LimitedAvailability"
                      : "https://schema.org/InStock",
                    url: `https://sap-efb.vercel.app/accounts/${account.id}`,
                    seller: {
                      "@type": "Organization",
                      name: "Sạp Acc eFootball",
                      url: "https://sap-efb.vercel.app",
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
          )}
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
                    item: "https://sap-efb.vercel.app",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: account.title,
                    item: `https://sap-efb.vercel.app/accounts/${account.id}`,
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
