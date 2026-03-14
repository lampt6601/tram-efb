import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { StatusBadge } from "@/components/ui/Badge";
import { ImageGallery } from "@/components/ui/ImageGallery";
import {
  formatCurrency,
  formatNumber,
  CONTACT_ZALO_URL,
  CONTACT_ZALO_GROUP_URL,
  CONTACT_MESSENGER_URL,
} from "@/lib/constants";
import {
  ArrowLeft,
  Zap,
  Coins,
  Shield,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import facebookIcon from "@/assets/icons/facebook.webp";
import zaloIcon from "@/assets/icons/zalo.png";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicAccount } from "@/types/database";
import { ogImage } from "@/lib/image-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

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
  const image = account.primary_image_url ? ogImage(account.primary_image_url) : undefined;

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
  const supabase = await createSupabaseServerClient();

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
      .select(
        "id, title, selling_price, images, primary_image_url, status, total_gp, total_coins_android, total_coins_ios, team_strength, server_region, created_at",
      )
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

    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-4 px-4 sm:mb-6 sm:px-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại Cửa Hàng
              </Link>
            </div>

            <div className="overflow-hidden shadow-sm sm:rounded-xl">
              <div className="grid gap-8 p-4 lg:grid-cols-2">
                {/* Images — greyed out */}
                <div className="relative">
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
                      <h1 className="text-2xl font-bold text-slate-700 line-through decoration-slate-400 lg:text-3xl">
                        {account.title}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        {account.server_region && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            Server: {account.server_region}
                          </span>
                        )}
                        {account.monthly_log_quota != null && (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                            Số lượng log: {account.monthly_log_quota}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status="Sold" />
                  </div>

                  {/* Sold banner */}
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4">
                    <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-emerald-800">
                        Tài khoản đã được bán
                      </p>
                      <p className="mt-0.5 text-sm text-emerald-600">
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
                        <div className="rounded-xl bg-amber-50 p-4 text-center opacity-60">
                          <Zap className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                          <p className="text-lg font-bold text-slate-900">
                            {formatNumber(account.total_gp)}
                          </p>
                          <p className="text-xs text-slate-500">Tổng GP</p>
                        </div>
                      )}
                      {((account.total_coins_android ?? 0) > 0 ||
                        (account.total_coins_ios ?? 0) > 0) && (
                        <div className="rounded-xl bg-yellow-50 p-4 text-center opacity-60">
                          <Coins className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
                          <p className="text-sm font-bold text-slate-900">
                            {(account.total_coins_android ?? 0) > 0
                              ? `${formatNumber(account.total_coins_android)} 🤖`
                              : ""}
                            {(account.total_coins_android ?? 0) > 0 &&
                            (account.total_coins_ios ?? 0) > 0
                              ? " | "
                              : ""}
                            {(account.total_coins_ios ?? 0) > 0
                              ? `${formatNumber(account.total_coins_ios)} 🍎`
                              : ""}
                          </p>
                          <p className="text-xs text-slate-500">Coins</p>
                        </div>
                      )}
                    {(account.team_strength ?? 0) > 0 && (
                        <div className="rounded-xl bg-blue-50 p-4 text-center opacity-60">
                          <Shield className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                          <p className="text-lg font-bold text-slate-900">
                            {account.team_strength}
                          </p>
                          <p className="text-xs text-slate-500">Lực Chiến</p>
                        </div>
                      )}
                    <div className="rounded-xl bg-indigo-50 p-4 text-center opacity-60">
                      <MessageCircle className="mx-auto mb-1 h-5 w-5 text-indigo-500" />
                      <p className="text-lg font-bold text-slate-900">
                        {account.monthly_log_quota ?? 10}
                      </p>
                      <p className="text-xs text-slate-500">
                        Số lượng log
                      </p>
                    </div>
                    </div>
                  )}

                  <div className="mt-auto pt-8">
                    <div className="mb-6">
                      <p className="text-sm text-slate-500">Giá Đã Bán</p>
                      <p className="text-3xl font-extrabold text-slate-400 line-through decoration-slate-300">
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
    `Hi, I'm interested in account: ${account.title} (ID: ${account.id})`,
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          {/* Back link */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại Cửa Hàng
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
            {/* Left — Images */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <ImageGallery images={galleryImages} title={account.title} />
            </div>

            {/* Right — Info card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              {/* Title */}
              <h1 className="flex items-start gap-2 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                <span>{account.title}</span>
                {account.is_priority && (
                  <Star className="mt-0.5 h-5 w-5 shrink-0 fill-amber-500 text-amber-500" />
                )}
              </h1>

              {/* Tags */}
              {(account.server_region || account.monthly_log_quota != null) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {account.server_region && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Server: {account.server_region}
                    </span>
                  )}
                  {account.monthly_log_quota != null && (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      Số lượng log: {account.monthly_log_quota}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              {Boolean(
                (account.total_gp ?? 0) > 0 ||
                (account.total_coins_android ?? 0) > 0 ||
                (account.total_coins_ios ?? 0) > 0 ||
                (account.team_strength ?? 0) > 0,
              ) && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {(account.total_gp ?? 0) > 0 && (
                    <div className="rounded-xl bg-amber-50 px-3 py-3 text-center">
                      <Zap className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                      <p className="text-base font-bold text-slate-900">
                        {formatNumber(account.total_gp)}
                      </p>
                      <p className="text-xs text-slate-500">Tổng GP</p>
                    </div>
                  )}
                  {((account.total_coins_android ?? 0) > 0 ||
                    (account.total_coins_ios ?? 0) > 0) && (
                    <div className="rounded-xl bg-yellow-50 px-3 py-3 text-center">
                      <Coins className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {(account.total_coins_android ?? 0) > 0
                          ? `${formatNumber(account.total_coins_android)} 🤖`
                          : ""}
                        {(account.total_coins_android ?? 0) > 0 &&
                        (account.total_coins_ios ?? 0) > 0
                          ? " · "
                          : ""}
                        {(account.total_coins_ios ?? 0) > 0
                          ? `${formatNumber(account.total_coins_ios)} 🍎`
                          : ""}
                      </p>
                      <p className="text-xs text-slate-500">Coins</p>
                    </div>
                  )}
                  {(account.team_strength ?? 0) > 0 && (
                    <div className="rounded-xl bg-blue-50 px-3 py-3 text-center">
                      <Shield className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                      <p className="text-base font-bold text-slate-900">
                        {account.team_strength}
                      </p>
                      <p className="text-xs text-slate-500">Lực Chiến</p>
                    </div>
                  )}
                  <div className="rounded-xl bg-indigo-50 px-3 py-3 text-center">
                    <MessageCircle className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
                    <p className="text-base font-bold text-slate-900">
                      {account.monthly_log_quota ?? 10}
                    </p>
                    <p className="text-xs text-slate-500">Số lượng log</p>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="my-5 border-t border-slate-100" />

              {/* Price */}
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Giá Bán
                </p>
                <div className="mt-1 flex items-end gap-3">
                  <p className={`text-3xl font-extrabold ${isSale ? "text-rose-600" : "text-indigo-600"}`}>
                    {formatCurrency(account.selling_price)}
                  </p>
                  {isSale && (
                    <div className="mb-0.5 flex flex-col">
                      <span className="text-sm font-medium text-slate-400 line-through">
                        {formatCurrency(account.original_price!)}
                      </span>
                      <span className="inline-flex w-fit items-center rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-600">
                        -{discount}% GIẢM
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={`${CONTACT_ZALO_URL}?text=${contactMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Image src={zaloIcon} alt="Zalo" className="h-5 w-5 object-contain" />
                  Liên hệ qua Zalo
                </a>
                <a
                  href={`${CONTACT_MESSENGER_URL}?ref=${contactMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 px-6 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                >
                  <Image src={facebookIcon} alt="Facebook" className="h-5 w-5 object-contain" />
                  Liên hệ qua Messenger
                </a>
              </div>

              {/* Group fallback notice */}
              <a
                href={CONTACT_ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:border-amber-300 hover:bg-amber-100"
              >
                <div className="mt-0.5 shrink-0">
                  <Image src={zaloIcon} alt="Zalo Group" className="h-5 w-5 object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-800">
                    Mình trả lời lâu? Tham gia Group Tư Vấn ngay!
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    Nếu chưa nhận được phản hồi, hãy vào group — có thành viên và admin hỗ trợ bạn 24/7.
                  </p>
                </div>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-400 transition-colors group-hover:text-amber-600" />
              </a>
            </div>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: account.title,
                image: galleryImages,
                description: `Tài khoản eFootball với lực chiến ${account.team_strength ?? 0} và tổng GP ${account.total_gp ?? 0}.`,
                sku: account.id,
                offers: {
                  "@type": "Offer",
                  priceCurrency: "VND",
                  price: account.selling_price,
                  availability: "https://schema.org/InStock",
                  url: `https://thc-efb.vercel.app/accounts/${account.id}`,
                },
              }),
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
