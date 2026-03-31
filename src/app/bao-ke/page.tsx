import { createSupabaseServiceClient } from "@/lib/supabase-service";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { formatCurrency } from "@/lib/constants";
import {
  ShieldCheck,
  ArrowLeft,
  BadgeCheck,
  Store,
  MessageCircle,
  ExternalLink,
  User,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 300; // 5 minutes

export const metadata: Metadata = {
  title: "Người Bán Được Bảo Kê | THC eFootball Shop",
  description:
    "Danh sách người bán được THC bảo kê giao dịch. Mua acc eFootball an toàn với mức bảo kê rõ ràng từ ký quỹ của người bán.",
};

interface SellerWithCollateral {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  collateral_amount: number;
  transaction_box_url: string | null;
  zalo_link: string | null;
  sold_count: number;
  available_count: number;
}

async function getGuaranteedSellers(): Promise<SellerWithCollateral[]> {
  const supabase = createSupabaseServiceClient();

  // Fetch sellers with collateral > 0
  const { data: sellers } = await supabase
    .from("admin_settings")
    .select(
      "user_id, display_name, avatar_url, collateral_amount, transaction_box_url, zalo_link"
    )
    .gt("collateral_amount", 0)
    .not("display_name", "is", null)
    .order("collateral_amount", { ascending: false });

  if (!sellers || sellers.length === 0) return [];

  // Get sold & available counts per seller
  const userIds = sellers.map((s) => s.user_id);

  const [{ data: soldCounts }, { data: availableCounts }] = await Promise.all([
    supabase
      .from("accounts")
      .select("user_id")
      .in("user_id", userIds)
      .eq("status", "Sold"),
    supabase
      .from("accounts")
      .select("user_id")
      .in("user_id", userIds)
      .eq("status", "Available"),
  ]);

  const soldMap = new Map<string, number>();
  const availableMap = new Map<string, number>();

  (soldCounts ?? []).forEach((r: { user_id: string }) => {
    soldMap.set(r.user_id, (soldMap.get(r.user_id) ?? 0) + 1);
  });
  (availableCounts ?? []).forEach((r: { user_id: string }) => {
    availableMap.set(r.user_id, (availableMap.get(r.user_id) ?? 0) + 1);
  });

  return sellers.map((s) => ({
    user_id: s.user_id,
    display_name: s.display_name!,
    avatar_url: s.avatar_url,
    collateral_amount: Number(s.collateral_amount),
    transaction_box_url: s.transaction_box_url,
    zalo_link: s.zalo_link,
    sold_count: soldMap.get(s.user_id) ?? 0,
    available_count: availableMap.get(s.user_id) ?? 0,
  }));
}

export default async function BaoKePage() {
  const sellers = await getGuaranteedSellers();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/50">
          <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" /> Về trang chủ
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 shadow-md dark:bg-emerald-500/20">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
                  Người Bán Được Bảo Kê
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Giao dịch an toàn với mức bảo kê từ ký quỹ của người bán
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Info banner */}
        <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Bảo kê là gì?</p>
                <p className="mt-1 leading-relaxed text-amber-700 dark:text-amber-400">
                  Mỗi người bán trên shop đã ký quỹ một số tiền cho THC.
                  Nếu xảy ra lừa đảo trong giao dịch, THC sẽ{" "}
                  <strong>hoàn tiền cho bạn</strong> từ khoản ký quỹ này, tối đa
                  bằng mức bảo kê hiển thị. Giao dịch có giá trị cao hơn mức bảo
                  kê, bạn nên nhờ THC làm trung gian.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller list */}
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          {sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
              <ShieldCheck className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Chưa có người bán nào được bảo kê
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellers.map((seller) => (
                <div
                  key={seller.user_id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {seller.avatar_url ? (
                      <Image
                        src={seller.avatar_url}
                        alt={seller.display_name}
                        width={56}
                        height={56}
                        className="h-12 w-12 shrink-0 rounded-2xl object-cover shadow-sm sm:h-14 sm:w-14"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm sm:h-14 sm:w-14 dark:bg-indigo-500/20">
                        <User className="h-6 w-6 text-indigo-500" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
                          {seller.display_name}
                        </h2>
                        {seller.sold_count > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <BadgeCheck className="h-3 w-3" />
                            Đã bán {seller.sold_count} acc
                          </span>
                        )}
                        {seller.available_count > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <Store className="h-3 w-3" />
                            {seller.available_count} đang bán
                          </span>
                        )}
                      </div>

                      {/* Collateral amount — the key info */}
                      <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-500/10">
                        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Hạn mức bảo kê tối đa
                          </p>
                          <p className="text-lg font-extrabold text-emerald-700 sm:text-xl dark:text-emerald-300">
                            {formatCurrency(seller.collateral_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/shop/${encodeURIComponent(seller.display_name)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white/60 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50 dark:border-indigo-500/20 dark:bg-slate-800/50 dark:text-indigo-400 dark:hover:bg-slate-700"
                        >
                          <Store className="h-3.5 w-3.5" />
                          Xem gian hàng
                        </Link>
                        {seller.transaction_box_url && (
                          <a
                            href={`/api/contact/seller/${encodeURIComponent(seller.display_name)}?type=transaction_box`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Box Giao Dịch
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom note */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-100/60 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Bạn có thể giao dịch trực tiếp với người bán hoặc nhờ{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                THC làm trung gian
              </strong>{" "}
              để đảm bảo an toàn. Liên hệ THC qua{" "}
              <a
                href="https://zalo.me/0969347283"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Zalo
              </a>{" "}
              nếu cần hỗ trợ.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
